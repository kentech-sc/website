import type { CompletionStatus } from '$lib/types/academic.type.js';
import type { User } from '$lib/types/user.type.js';

import * as AcademicRepository from '$lib/repositories/academic.repository.js';
import { readCourseOfferingWorkbook } from '$lib/server/course-workbook.js';
import { transaction } from '$lib/server/db.js';
import { AppError } from '$lib/server/errors.js';
import * as CourseService from '$lib/services/course.service.js';
import { AP_COURSE_CREDITS, isApCreditCode } from '$lib/shared/academic-credit.js';
import { resolveCompletionStatus } from '$lib/shared/completion.js';
import { calculateDegreeProgress } from '$lib/shared/degree.js';
import { hasCapability } from '$lib/shared/permission.js';
import { parsePortalCompletionText } from '$lib/shared/portal-completion-import.js';
import { APP_ERROR } from '$lib/shared/rule.js';
import { DEGREE_CATEGORIES, type DegreeCategory } from '$lib/types/degree.type.js';

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
		courses: courses.filter((course) => !isApCreditCode(course.id)),
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

export async function addCompletion(
	user: User,
	courseId: string,
	year: number,
	term: number,
	credits: number,
	grade: string | null,
	status: CompletionStatus
) {
	if (!courseId || year < 2022 || term < 1 || term > 4 || !Number.isFinite(credits) || credits < 0)
		throw new AppError(APP_ERROR.BAD_REQUEST, '수강 이력을 확인해주세요.');
	const course = (await CourseService.findCourseMapByIds([courseId])).get(courseId);
	if (!course) throw new AppError(APP_ERROR.NOT_FOUND, '강의를 찾을 수 없습니다.');
	credits = course.credits;
	const normalizedGrade = grade?.trim().toUpperCase() || null;
	status = resolveCompletionStatus(normalizedGrade, status);
	if (!['passed', 'failed', 'withdrawn'].includes(status))
		throw new AppError(APP_ERROR.BAD_REQUEST, '이수 결과를 확인해주세요.');
	return await AcademicRepository.createCompletion({
		userId: user.id,
		courseId,
		offeringId: null,
		externalCourseId: null,
		year,
		term,
		credits,
		grade: normalizedGrade,
		status,
		source: 'manual'
	});
}

export async function addExternalCompletion(
	user: User,
	institution: string,
	courseCode: string,
	courseName: string,
	year: number,
	term: number,
	credits: number,
	grade: string | null,
	status: CompletionStatus
) {
	institution = institution.trim();
	courseCode = courseCode.trim().toUpperCase();
	courseName = courseName.trim();
	if (
		!institution ||
		!courseCode ||
		!courseName ||
		year < 2022 ||
		term < 1 ||
		term > 4 ||
		!Number.isFinite(credits) ||
		credits < 0
	)
		throw new AppError(APP_ERROR.BAD_REQUEST, '학점교류 수강 이력을 확인해주세요.');
	const normalizedGrade = grade?.trim().toUpperCase() || null;
	status = resolveCompletionStatus(normalizedGrade, status);
	if (!['passed', 'failed', 'withdrawn'].includes(status))
		throw new AppError(APP_ERROR.BAD_REQUEST, '이수 결과를 확인해주세요.');
	return await transaction(async () => {
		const externalCourse = await AcademicRepository.upsertExternalCourse({
			institution,
			courseCode,
			name: courseName
		});
		await AcademicRepository.upsertCompletions([
			{
				userId: user.id,
				courseId: null,
				offeringId: null,
				externalCourseId: externalCourse.id,
				year,
				term,
				credits,
				grade: normalizedGrade,
				status,
				source: 'manual'
			}
		]);
	});
}

export async function removeCompletion(user: User, id: string) {
	if (!(await AcademicRepository.deleteCompletion(id, user.id)))
		throw new AppError(APP_ERROR.NOT_FOUND, '수강 이력을 찾을 수 없습니다.');
}

export async function importCompletions(user: User, portalData: string) {
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
	const matched = parsed.rows.filter(
		(row) => courseMap.has(row.courseId) || isApCreditCode(row.courseId)
	);
	const unmatchedCodes = [
		...new Set(
			parsed.rows
				.filter((row) => !courseMap.has(row.courseId) && !isApCreditCode(row.courseId))
				.map((row) => row.courseId)
		)
	];
	const creditMismatch = matched.find((row) => {
		const course = courseMap.get(row.courseId);
		const expectedCredits = isApCreditCode(row.courseId) ? AP_COURSE_CREDITS : row.credits;
		return course && course.credits !== expectedCredits;
	});
	if (creditMismatch)
		throw new AppError(
			APP_ERROR.CONFLICT,
			`${creditMismatch.courseId}의 등록된 학점과 KIS 이수 학점이 다릅니다.`
		);
	if (!matched.length)
		throw new AppError(
			APP_ERROR.BAD_REQUEST,
			`등록된 강의와 연결되는 과목이 없습니다.${unmatchedCodes.length ? ` 미연결: ${unmatchedCodes.join(', ')}` : ''}`
		);

	await transaction(async () => {
		await AcademicRepository.upsertApCreditCourses(
			matched
				.filter((row) => isApCreditCode(row.courseId))
				.map((row) => ({ id: row.courseId, name: row.courseName }))
		);
		await AcademicRepository.upsertCompletions(
			matched.map((row) => ({
				userId: user.id,
				courseId: row.courseId,
				offeringId: null,
				externalCourseId: null,
				year: row.year,
				term: row.term,
				credits:
					courseMap.get(row.courseId)?.credits ??
					(isApCreditCode(row.courseId) ? AP_COURSE_CREDITS : row.credits),
				grade: row.grade,
				status: row.status,
				source: 'portal'
			}))
		);
	});
	return {
		importedCount: matched.length,
		failedCount: matched.filter((row) => row.status === 'failed').length,
		withdrawnCount: matched.filter((row) => row.status === 'withdrawn').length,
		unmatchedCodes,
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
	for (const offering of result.offerings) {
		const existing = existingCourses.get(offering.courseId);
		if (
			existing &&
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
	let creditType: 'numeric' | 'pass' = input.creditType === 'pass' ? 'pass' : 'numeric';
	let subcategory = input.subcategory?.trim().toLowerCase() || null;
	let level = input.level;

	if (!/^[A-Z][A-Z0-9_.-]{2,19}$/.test(courseId))
		throw new AppError(
			APP_ERROR.BAD_REQUEST,
			'강의 코드는 영문으로 시작하는 3~20자로 입력해주세요.'
		);
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
	if (isApCreditCode(courseId)) {
		subcategory = 'ap';
		level = null;
		creditType = 'numeric';
	}

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
