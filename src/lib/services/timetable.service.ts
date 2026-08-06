import type { Timetable } from '$lib/types/timetable.type.js';
import type { User } from '$lib/types/user.type.js';

import * as AcademicRepository from '$lib/repositories/academic.repository.js';
import * as TimetableRepository from '$lib/repositories/timetable.repository.js';
import { AppError } from '$lib/server/errors.js';
import { getCourseSequenceProgress, hasMeetingConflict } from '$lib/shared/degree.js';
import { APP_ERROR } from '$lib/shared/rule.js';

async function owned(id: string, user: User): Promise<Timetable> {
	const timetable = await TimetableRepository.findTimetable(id, user.id);
	if (!timetable) throw new AppError(APP_ERROR.NOT_FOUND, '시간표를 찾을 수 없습니다.');
	return timetable;
}

async function validateCompletedCourses(
	courseIds: string[],
	user: User,
	completedCourseIds?: Set<string>
) {
	const completed =
		completedCourseIds ??
		new Set(
			(await AcademicRepository.findCompletedDegreeCourses(user.id)).map((course) => course.code)
		);
	const alreadyCompleted = [...new Set(courseIds)].filter((courseId) => completed.has(courseId));
	if (alreadyCompleted.length)
		throw new AppError(
			APP_ERROR.BAD_REQUEST,
			`이미 이수한 과목은 시간표에 담을 수 없습니다: ${alreadyCompleted.join(', ')}`
		);
	return completed;
}

async function validateEspSequence(
	courseIds: string[],
	user: User,
	completedCourseIds?: Set<string>
) {
	if (!courseIds.length) return;
	const profile = await AcademicRepository.findAcademicProfile(user.id);
	if (!profile)
		throw new AppError(
			APP_ERROR.BAD_REQUEST,
			'이수·졸업에서 입학연도와 ESP 면제 과목을 먼저 저장해주세요.'
		);
	const policy = await AcademicRepository.findGraduationPolicy(profile.admissionYear);
	const sequence = policy?.rules.courseSequences?.find((item) => item.category === 'ESP');
	if (!sequence) throw new AppError(APP_ERROR.INTERNAL, 'ESP 이수 순서 정책을 찾을 수 없습니다.');
	const completedCourses =
		completedCourseIds ??
		new Set(
			(await AcademicRepository.findCompletedDegreeCourses(user.id)).map((course) => course.code)
		);
	const progress = getCourseSequenceProgress(
		sequence,
		completedCourses,
		profile.espWaivedCourseIds
	);
	if (!progress.availableCourseIds.length)
		throw new AppError(APP_ERROR.BAD_REQUEST, 'ESP 필수 과정을 이미 모두 이수했습니다.');
	const unavailableCourseIds = courseIds.filter(
		(courseId) => !progress.availableCourseIds.includes(courseId)
	);
	if (unavailableCourseIds.length)
		throw new AppError(
			APP_ERROR.BAD_REQUEST,
			`현재 단계에서 담을 수 있는 ESP 과목은 ${progress.availableCourseIds.join(', ')}입니다.`
		);
}

export async function create(year: number, term: number, name: string, user: User) {
	if (year < 2022 || term < 1 || term > 4)
		throw new AppError(APP_ERROR.BAD_REQUEST, '학기 정보를 확인해주세요.');
	const position = await TimetableRepository.nextPosition(user.id, year, term);
	const created = await TimetableRepository.createTimetable({
		userId: user.id,
		year,
		term,
		name: name.trim() || `시간표 ${position + 1}`,
		position
	});
	if (!created) throw new AppError(APP_ERROR.CONFLICT, '이미 같은 이름의 시간표가 있습니다.');
	return created;
}

export async function addOffering(id: string, offeringId: string, user: User) {
	const timetable = await owned(id, user);
	const offering = await AcademicRepository.findOffering(offeringId);
	if (!offering || offering.year !== timetable.year || offering.term !== timetable.term)
		throw new AppError(APP_ERROR.BAD_REQUEST, '해당 학기의 개설 강좌가 아닙니다.');
	if (timetable.offerings.some((item) => item.id === offering.id)) return;
	if (timetable.offerings.some((item) => item.courseId === offering.courseId))
		throw new AppError(APP_ERROR.CONFLICT, '같은 과목의 다른 분반이 이미 들어 있습니다.');
	const completedCourseIds = await validateCompletedCourses([offering.courseId], user);
	if (offering.category === 'ESP')
		await validateEspSequence(
			[
				...timetable.offerings
					.filter((item) => item.category === 'ESP')
					.map((item) => item.courseId),
				offering.courseId
			],
			user,
			completedCourseIds
		);
	const conflict = timetable.offerings.find((item) =>
		item.meetings.some((a) => offering.meetings.some((b) => hasMeetingConflict(a, b)))
	);
	if (conflict)
		throw new AppError(APP_ERROR.CONFLICT, `${conflict.courseName} 강좌와 시간이 겹칩니다.`);
	if (timetable.isConfirmed)
		await TimetableRepository.updateTimetable(id, user.id, { isConfirmed: false });
	await TimetableRepository.addItem(id, offeringId);
}

export async function removeOffering(id: string, offeringId: string, user: User) {
	const timetable = await owned(id, user);
	if (timetable.isConfirmed)
		await TimetableRepository.updateTimetable(id, user.id, { isConfirmed: false });
	await TimetableRepository.removeItem(id, offeringId);
}

export async function copy(id: string, user: User) {
	const source = await owned(id, user);
	const position = await TimetableRepository.nextPosition(user.id, source.year, source.term);
	const target = await TimetableRepository.createTimetable({
		userId: user.id,
		year: source.year,
		term: source.term,
		name: `${source.name} 복사본 ${position + 1}`,
		position
	});
	if (!target) throw new AppError(APP_ERROR.CONFLICT, '이미 같은 이름의 시간표가 있습니다.');
	await TimetableRepository.copyItems(source.id, target.id);
	return target;
}

export async function confirm(id: string, user: User) {
	const timetable = await owned(id, user);
	const completedCourseIds = await validateCompletedCourses(
		timetable.offerings.map((offering) => offering.courseId),
		user
	);
	await validateEspSequence(
		timetable.offerings
			.filter((offering) => offering.category === 'ESP')
			.map((offering) => offering.courseId),
		user,
		completedCourseIds
	);
	await TimetableRepository.clearConfirmed(user.id, timetable.year, timetable.term);
	return await TimetableRepository.updateTimetable(id, user.id, { isConfirmed: true });
}

export async function unconfirm(id: string, user: User) {
	const timetable = await owned(id, user);
	if (!timetable.isConfirmed) return timetable;
	return await TimetableRepository.updateTimetable(id, user.id, { isConfirmed: false });
}

export async function rename(id: string, name: string, user: User) {
	await owned(id, user);
	if (!name.trim()) throw new AppError(APP_ERROR.BAD_REQUEST, '시간표 이름을 입력해주세요.');
	const renamed = await TimetableRepository.renameTimetable(id, user.id, name.trim());
	if (!renamed) throw new AppError(APP_ERROR.CONFLICT, '이미 같은 이름의 시간표가 있습니다.');
	return renamed;
}

export async function remove(id: string, user: User) {
	await owned(id, user);
	await TimetableRepository.deleteTimetable(id, user.id);
}
