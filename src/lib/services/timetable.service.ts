import type { Timetable } from '$lib/types/timetable.type.js';
import type { User } from '$lib/types/user.type.js';

import * as AcademicRepository from '$lib/repositories/academic.repository.js';
import * as TimetableRepository from '$lib/repositories/timetable.repository.js';
import { AppError } from '$lib/server/errors.js';
import { getCourseSequenceProgress, hasMeetingConflict } from '$lib/shared/degree.js';
import { APP_ERROR } from '$lib/shared/rule.js';

export interface TimetableConflict {
	firstOfferingId: string;
	secondOfferingId: string;
}

export function findTimetableConflicts(
	offerings: Array<{
		id: string;
		meetings: Array<{ weekday: number; startsAt: number; endsAt: number }>;
	}>
): TimetableConflict[] {
	const conflicts: TimetableConflict[] = [];
	for (let firstIndex = 0; firstIndex < offerings.length; firstIndex += 1) {
		for (let secondIndex = firstIndex + 1; secondIndex < offerings.length; secondIndex += 1) {
			const first = offerings[firstIndex];
			const second = offerings[secondIndex];
			if (
				first.meetings.some((left) =>
					second.meetings.some((right) => hasMeetingConflict(left, right))
				)
			)
				conflicts.push({ firstOfferingId: first.id, secondOfferingId: second.id });
		}
	}
	return conflicts;
}

async function owned(id: string, user: User): Promise<Timetable> {
	const timetable = await TimetableRepository.findTimetable(id, user.id);
	if (!timetable) throw new AppError(APP_ERROR.NOT_FOUND, '시간표를 찾을 수 없습니다.');
	return timetable;
}

async function validateEspSequence(courseIds: string[], user: User) {
	if (!courseIds.length) return;
	const profile = await AcademicRepository.findAcademicProfile(user.id);
	if (!profile)
		throw new AppError(
			APP_ERROR.BAD_REQUEST,
			'이수·졸업에서 입학연도와 ESP 면제 교과목을 먼저 저장해주세요.'
		);
	const policy = await AcademicRepository.findGraduationPolicy(profile.admissionYear);
	const sequence = policy?.rules.courseSequences?.find((item) => item.category === 'ESP');
	if (!sequence) throw new AppError(APP_ERROR.INTERNAL, 'ESP 이수 순서 정책을 찾을 수 없습니다.');
	const completedCourses = new Set(
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
	if (
		!offering ||
		offering.archivedAt !== null ||
		offering.year !== timetable.year ||
		offering.term !== timetable.term
	)
		throw new AppError(APP_ERROR.BAD_REQUEST, '해당 학기의 개설 강좌가 아닙니다.');
	const activeOfferings = timetable.offerings.filter((item) => item.archivedAt === null);
	if (activeOfferings.some((item) => item.id === offering.id)) return;
	if (activeOfferings.some((item) => item.courseId === offering.courseId))
		throw new AppError(APP_ERROR.CONFLICT, '같은 과목의 다른 분반이 이미 들어 있습니다.');
	if (offering.category === 'ESP')
		await validateEspSequence(
			[
				...activeOfferings.filter((item) => item.category === 'ESP').map((item) => item.courseId),
				offering.courseId
			],
			user
		);
	const conflict = activeOfferings.find((item) =>
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

export async function replaceOffering(
	id: string,
	fromOfferingId: string,
	toOfferingId: string,
	user: User
) {
	const timetable = await owned(id, user);
	const source = timetable.offerings.find((offering) => offering.id === fromOfferingId);
	if (!source) throw new AppError(APP_ERROR.NOT_FOUND, '교체할 강의가 시간표에 없습니다.');
	if (fromOfferingId === toOfferingId)
		throw new AppError(APP_ERROR.BAD_REQUEST, '같은 강의로 교체할 수 없습니다.');

	await removeOffering(id, fromOfferingId, user);
	await addOffering(id, toOfferingId, user);
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
	if (timetable.offerings.some((offering) => offering.archivedAt !== null))
		throw new AppError(APP_ERROR.CONFLICT, '폐강된 강의를 시간표에서 제거한 뒤 확정해 주세요.');
	if (
		timetable.offerings.some(
			(offering) => offering.year !== timetable.year || offering.term !== timetable.term
		)
	)
		throw new AppError(APP_ERROR.CONFLICT, '다른 학기의 강의가 포함되어 있습니다.');
	const duplicateCourse = timetable.offerings.find((offering, index, offerings) =>
		offerings.slice(index + 1).some((candidate) => candidate.courseId === offering.courseId)
	);
	if (duplicateCourse)
		throw new AppError(
			APP_ERROR.CONFLICT,
			`${duplicateCourse.courseName}의 여러 분반이 함께 들어 있습니다.`
		);
	const [conflict] = findTimetableConflicts(timetable.offerings);
	if (conflict) {
		const first = timetable.offerings.find(({ id }) => id === conflict.firstOfferingId)!;
		const second = timetable.offerings.find(({ id }) => id === conflict.secondOfferingId)!;
		throw new AppError(
			APP_ERROR.CONFLICT,
			`${first.courseName}과 ${second.courseName}의 수업 시간이 겹칩니다.`
		);
	}
	await validateEspSequence(
		timetable.offerings
			.filter((offering) => offering.category === 'ESP')
			.map((offering) => offering.courseId),
		user
	);
	await TimetableRepository.clearConfirmed(user.id, timetable.year, timetable.term);
	await TimetableRepository.clearChangeReasons(timetable.id);
	return await TimetableRepository.updateTimetable(id, user.id, { isConfirmed: true });
}

export async function unconfirm(id: string, user: User) {
	const timetable = await owned(id, user);
	if (!timetable.isConfirmed) return timetable;
	return await TimetableRepository.updateTimetable(id, user.id, { isConfirmed: false });
}

export async function acknowledgeChanges(id: string, user: User) {
	await owned(id, user);
	await TimetableRepository.clearAcknowledgedChangeReasons(id);
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
