import type { CompletionStatus } from '$lib/types/academic.type.js';
import type { User } from '$lib/types/user.type.js';

import * as AcademicRepository from '$lib/repositories/academic.repository.js';
import { readCourseOfferingWorkbook } from '$lib/server/course-workbook.js';
import { transaction } from '$lib/server/db.js';
import { AppError } from '$lib/server/errors.js';
import * as CourseService from '$lib/services/course.service.js';
import { resolveCompletionStatus } from '$lib/shared/completion-status.js';
import { calculateDegreeProgress } from '$lib/shared/degree.js';
import { hasCapability } from '$lib/shared/permission.js';
import {
	isSameCourseName,
	parsePortalCompletionText
} from '$lib/shared/portal-completion-import.js';
import { APP_ERROR } from '$lib/shared/rule.js';
import { DEGREE_CATEGORIES, type DegreeCategory } from '$lib/types/degree.type.js';

// 학교마다 코드 체계가 달라 형태를 제한하지 않는다. 이 값이 곧 강의 PK라 공백과 길이만 막는다.
const COURSE_CODE_PATTERN = /^\S{1,20}$/;

/** 이수구분을 졸업요건 영역으로 맞춘다. 모르는 값은 영역 없음으로 둔다. */
function toDegreeCategory(category: string): DegreeCategory | null {
	const normalized = category.trim().toUpperCase();
	return (DEGREE_CATEGORIES as readonly string[]).includes(normalized)
		? (normalized as DegreeCategory)
		: null;
}

export async function getProfileData(user: User) {
	const [academicProfile, completions, courses, completedDegreeCourses] = await Promise.all([
		AcademicRepository.findAcademicProfile(user.id),
		AcademicRepository.findCompletionViews(user.id),
		CourseService.findCourses(),
		AcademicRepository.findCompletedDegreeCourses(user.id)
	]);
	const policy = await AcademicRepository.findGraduationPolicy(
		academicProfile?.admissionYear ?? new Date().getFullYear()
	);
	const espCourseIds =
		policy?.rules.courseSequences?.find((sequence) => sequence.category === 'ESP')?.stages.flat() ??
		[];
	const courseMap = new Map(courses.map((course) => [course.id, course.name]));
	return {
		academicProfile,
		completions,
		courses,
		espCourses: espCourseIds.map((id) => ({ id, name: courseMap.get(id) ?? id })),
		degreeProgress:
			academicProfile && policy
				? calculateDegreeProgress(completedDegreeCourses, policy.rules, {
						ESP: academicProfile.espWaivedCourseIds
					})
				: null,
		canManageCatalog: hasCapability(user, 'course.manage')
	};
}

export async function saveProfile(user: User, admissionYear: number, espWaivedCourseIds: string[]) {
	if (admissionYear < 2022 || admissionYear > 2100)
		throw new AppError(APP_ERROR.BAD_REQUEST, '입학연도를 확인해주세요.');
	const policy = await AcademicRepository.findGraduationPolicy(admissionYear);
	if (!policy) throw new AppError(APP_ERROR.BAD_REQUEST, '해당 입학연도의 졸업요건이 없습니다.');
	const allowedIds = new Set(
		policy.rules.courseSequences?.find((sequence) => sequence.category === 'ESP')?.stages.flat() ??
			[]
	);
	const normalizedWaivedIds = [...new Set(espWaivedCourseIds.filter((id) => allowedIds.has(id)))];
	if (normalizedWaivedIds.length !== new Set(espWaivedCourseIds).size)
		throw new AppError(APP_ERROR.BAD_REQUEST, 'ESP 면제 과목을 확인해주세요.');
	return await AcademicRepository.upsertAcademicProfile({
		userId: user.id,
		admissionYear,
		espWaivedCourseIds: normalizedWaivedIds
	});
}

/**
 * 수강 이력을 한 건 추가한다.
 * `courseName`이 비어 있으면 목록에서 고른 기존 강의고, 채워져 있으면 목록에 없는 강의를 새로 등록하는 것이다.
 */
export async function addCompletion(
	user: User,
	input: {
		courseId: string;
		courseName: string;
		credits: number;
		category: string;
		year: number;
		term: number;
		grade: string | null;
		status: CompletionStatus;
	}
) {
	const courseId = input.courseId.trim().toUpperCase();
	const courseName = input.courseName.trim();
	if (!courseId || input.year < 2022 || input.term < 1 || input.term > 4)
		throw new AppError(APP_ERROR.BAD_REQUEST, '수강 이력을 확인해주세요.');

	const normalizedGrade = input.grade?.trim().toUpperCase() || null;
	const status = resolveCompletionStatus(normalizedGrade, input.status);
	if (!['passed', 'failed', 'withdrawn'].includes(status))
		throw new AppError(APP_ERROR.BAD_REQUEST, '이수 결과를 확인해주세요.');

	const existingCourse = (await CourseService.findCourseMapByIds([courseId])).get(courseId);
	if (courseName && existingCourse)
		throw new AppError(
			APP_ERROR.CONFLICT,
			`이미 존재하는 과목 코드입니다. (${courseId} · ${existingCourse.name})`
		);
	if (!courseName && !existingCourse)
		throw new AppError(APP_ERROR.NOT_FOUND, '강의를 찾을 수 없습니다.');

	const credits = existingCourse?.credits ?? input.credits;
	if (!Number.isFinite(credits) || credits < 0)
		throw new AppError(APP_ERROR.BAD_REQUEST, '학점을 확인해주세요.');

	return await transaction(async () => {
		if (!existingCourse) {
			if (!COURSE_CODE_PATTERN.test(courseId))
				throw new AppError(APP_ERROR.BAD_REQUEST, '강의 코드는 공백 없이 1~20자로 입력해주세요.');
			if (courseName.length > 200)
				throw new AppError(APP_ERROR.BAD_REQUEST, '강의명은 1~200자로 입력해주세요.');
			await CourseService.createCourse({
				id: courseId,
				name: courseName,
				credits,
				creditType: 'numeric',
				category: toDegreeCategory(input.category),
				subcategory: null,
				level: null,
				gradExcluded: false
			});
		}
		const completion = await AcademicRepository.createCompletion({
			userId: user.id,
			courseId,
			offeringId: null,
			year: input.year,
			term: input.term,
			credits,
			grade: normalizedGrade,
			status,
			source: 'manual'
		});
		if (!completion) throw new AppError(APP_ERROR.CONFLICT, '이미 수강한 과목입니다.');
		return completion;
	});
}

export async function removeCompletion(user: User, id: string) {
	if (!(await AcademicRepository.deleteCompletion(id, user.id)))
		throw new AppError(APP_ERROR.NOT_FOUND, '수강 이력을 찾을 수 없습니다.');
}

export async function importCompletions(user: User, portalData: string, hideGrade = false) {
	if (!portalData.trim() || portalData.length > 200_000)
		throw new AppError(APP_ERROR.BAD_REQUEST, '붙여넣은 수강 이력 데이터를 확인해주세요.');
	const parsed = parsePortalCompletionText(portalData);
	if (!parsed.rows.length)
		throw new AppError(
			APP_ERROR.BAD_REQUEST,
			'등록할 수강 이력을 찾지 못했습니다. KIS 전체성적조회에서 다시 추출해주세요.'
		);
	if (parsed.rows.length > 1_000)
		throw new AppError(APP_ERROR.BAD_REQUEST, '한 번에 1,000개 과목까지만 등록할 수 있습니다.');

	const courseMap = await CourseService.findCourseMapByIds(parsed.rows.map((row) => row.courseId));
	// 같은 코드가 이미 다른 강의명으로 있으면 남의 과목에 붙을 수 있으니 등록하지 않는다.
	const nameMismatchRows = parsed.rows.filter((row) => {
		const course = courseMap.get(row.courseId);
		return course && !isSameCourseName(course.name, row.courseName);
	});
	const nameMismatchCodes = [...new Set(nameMismatchRows.map((row) => row.courseId))];
	const importable = parsed.rows.filter((row) => !nameMismatchCodes.includes(row.courseId));
	const newCourseCodes = [
		...new Set(importable.filter((row) => !courseMap.has(row.courseId)).map((row) => row.courseId))
	];
	const creditMismatch = importable.find((row) => {
		const course = courseMap.get(row.courseId);
		// P 학점 과목은 카탈로그에 0학점으로 저장되지만 KIS는 실제 학점을 알려주므로 비교하지 않는다.
		if (!course || course.creditType === 'pass') return false;
		return course.credits !== row.credits;
	});
	if (creditMismatch)
		throw new AppError(
			APP_ERROR.CONFLICT,
			`${creditMismatch.courseId}의 등록된 학점과 KIS 이수 학점이 다릅니다.`
		);

	await transaction(async () => {
		// 처음 보는 과목코드는 KIS가 알려준 정보 그대로 강의로 등록한다.
		for (const code of newCourseCodes) {
			const row = importable.find((item) => item.courseId === code)!;
			await CourseService.createCourse({
				id: code,
				name: row.courseName,
				credits: row.credits,
				creditType: 'numeric',
				category: toDegreeCategory(row.category),
				subcategory: null,
				level: null,
				gradExcluded: false
			});
		}

		await AcademicRepository.upsertCompletions(
			importable.map((row) => ({
				userId: user.id,
				courseId: row.courseId,
				offeringId: null,
				year: row.year,
				term: row.term,
				credits: courseMap.get(row.courseId)?.credits ?? row.credits,
				grade: hideGrade ? null : row.grade,
				status: row.status,
				source: 'portal'
			}))
		);
	});
	return {
		importedCount: importable.length,
		failedCount: importable.filter((row) => row.status === 'failed').length,
		withdrawnCount: importable.filter((row) => row.status === 'withdrawn').length,
		newCourseCodes,
		nameMismatchCodes,
		skippedCount: parsed.skippedCount
	};
}

export async function importOfferings(user: User, file: File, year: number, term: number) {
	if (!hasCapability(user, 'course.manage'))
		throw new AppError(APP_ERROR.FORBIDDEN, '개설 강좌를 관리할 권한이 없습니다.');
	if (!Number.isInteger(year) || year < 2022 || !Number.isInteger(term) || term < 1 || term > 4)
		throw new AppError(APP_ERROR.BAD_REQUEST, '개설 연도와 학기를 확인해주세요.');
	let result;
	try {
		result = await readCourseOfferingWorkbook(file, year, term);
	} catch (error) {
		throw new AppError(
			APP_ERROR.BAD_REQUEST,
			error instanceof Error ? error.message : '엑셀 파일을 읽을 수 없습니다.'
		);
	}
	const incomingCredits = new Map<string, string>();
	for (const offering of result.offerings) {
		const definition = `${offering.credits}:${offering.creditType}`;
		const previous = incomingCredits.get(offering.courseId);
		if (previous && previous !== definition)
			throw new AppError(
				APP_ERROR.BAD_REQUEST,
				`${offering.courseId}의 학점 정보가 파일 안에서 서로 다릅니다.`
			);
		incomingCredits.set(offering.courseId, definition);
	}
	const existingCourses = await CourseService.findCourseMapByIds([...incomingCredits.keys()]);
	// 개설된 적 없는 강의는 수강 이력에서 임시로 만들어진 것이므로, 엑셀 파일을 정본으로 보고 덮어쓴다.
	const offeredCourseIds = await AcademicRepository.findOfferedCourseIds([
		...incomingCredits.keys()
	]);
	for (const offering of result.offerings) {
		const existing = existingCourses.get(offering.courseId);
		if (
			existing &&
			offeredCourseIds.has(offering.courseId) &&
			(existing.credits !== offering.credits || existing.creditType !== offering.creditType)
		)
			throw new AppError(
				APP_ERROR.CONFLICT,
				`${offering.courseId}의 기존 학점 정보와 엑셀 파일이 다릅니다.`
			);
	}
	await transaction(async () => {
		await AcademicRepository.archiveOfferings(year, term);
		for (const value of result.offerings) await AcademicRepository.upsertOfferingImport(value);
	});
	return {
		importedCount: result.offerings.length,
		skippedClosedCount: result.skippedClosedCount,
		passCreditCount: result.passCreditCount,
		multipleProfessorCount: result.multipleProfessorCount
	};
}

export async function createSpecialCourse(
	user: User,
	input: {
		courseId: string;
		courseName: string;
		credits: number;
		creditType: string;
		category: string;
		subcategory: string | null;
		level: number | null;
		gradExcluded: boolean;
	}
) {
	if (!hasCapability(user, 'course.manage'))
		throw new AppError(APP_ERROR.FORBIDDEN, '특수 강의를 관리할 권한이 없습니다.');

	const courseId = input.courseId.trim().toUpperCase();
	const courseName = input.courseName.trim();
	const category = input.category.trim().toUpperCase() as DegreeCategory;
	const creditType: 'numeric' | 'pass' = input.creditType === 'pass' ? 'pass' : 'numeric';
	let subcategory = input.subcategory?.trim().toLowerCase() || null;
	let level = input.level;

	if (!COURSE_CODE_PATTERN.test(courseId))
		throw new AppError(APP_ERROR.BAD_REQUEST, '강의 코드는 공백 없이 1~20자로 입력해주세요.');
	if (!courseName || courseName.length > 200)
		throw new AppError(APP_ERROR.BAD_REQUEST, '강의명은 1~200자로 입력해주세요.');
	if (!Number.isFinite(input.credits) || input.credits < 0 || input.credits > 99)
		throw new AppError(APP_ERROR.BAD_REQUEST, '학점은 0~99 사이로 입력해주세요.');
	if (!['numeric', 'pass'].includes(input.creditType))
		throw new AppError(APP_ERROR.BAD_REQUEST, '학점 방식을 확인해주세요.');
	if (!(DEGREE_CATEGORIES as readonly string[]).includes(category))
		throw new AppError(APP_ERROR.BAD_REQUEST, '졸업요건 영역을 확인해주세요.');
	if (level !== null && (!Number.isInteger(level) || level < 1 || level > 9))
		throw new AppError(APP_ERROR.BAD_REQUEST, '레벨은 1~9 사이의 정수로 입력해주세요.');

	if (category !== 'EF') subcategory = null;
	if (category !== 'EL') level = null;

	const course = await CourseService.createCourse({
		id: courseId,
		name: courseName,
		credits: creditType === 'pass' ? 0 : input.credits,
		creditType,
		category,
		subcategory,
		level,
		gradExcluded: input.gradExcluded
	});
	if (!course) throw new AppError(APP_ERROR.CONFLICT, '이미 등록된 강의 코드입니다.');
	return { createdCourse: course };
}
