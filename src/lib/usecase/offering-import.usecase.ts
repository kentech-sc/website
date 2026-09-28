import type { TimetableItemChangeReason } from '$lib/types/timetable.type.js';
import type { User } from '$lib/types/user.type.js';

import * as OfferingRepository from '$lib/repositories/offering.repository.js';
import * as ReviewRepository from '$lib/repositories/review.repository.js';
import * as TimetableRepository from '$lib/repositories/timetable.repository.js';
import { readCourseOfferingWorkbook } from '$lib/server/course-workbook.js';
import { transaction } from '$lib/server/db.js';
import { AppError } from '$lib/server/errors.js';
import * as CourseService from '$lib/services/course.service.js';
import { compareOfferingImport } from '$lib/shared/course-offering-import.js';
import { hasCapability } from '$lib/shared/permission.js';
import { APP_ERROR } from '$lib/shared/rule.js';

const offeringKey = (courseId: string, section: string) => `${courseId}\u0000${section}`;

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
		if (previous && previous !== definition) {
			throw new AppError(
				APP_ERROR.BAD_REQUEST,
				`${offering.courseId}의 학점 정보가 파일 안에서 서로 다릅니다.`
			);
		}
		incomingCredits.set(offering.courseId, definition);
	}

	const existingCourses = await CourseService.findCourseMapByIds([...incomingCredits.keys()]);
	const offeredCourseIds = await OfferingRepository.findOfferedCourseIds([
		...incomingCredits.keys()
	]);
	for (const offering of result.offerings) {
		const existing = existingCourses.get(offering.courseId);
		if (
			existing &&
			offeredCourseIds.has(offering.courseId) &&
			(existing.credits !== offering.credits || existing.creditType !== offering.creditType)
		) {
			throw new AppError(
				APP_ERROR.CONFLICT,
				`${offering.courseId}의 기존 학점 정보와 엑셀 파일이 다릅니다.`
			);
		}
	}

	const existingOfferings = (
		await OfferingRepository.findOfferingsIncludingArchived(year, term)
	).filter((offering) => offering.academicCareer === result.academicCareer);
	const existingByKey = new Map(
		existingOfferings.map((offering) => [
			offeringKey(offering.courseId, offering.section),
			offering
		])
	);
	const incomingKeys = new Set(
		result.offerings.map((offering) => offeringKey(offering.courseId, offering.section))
	);
	const newOfferingCount = result.offerings.filter(
		(offering) => !existingByKey.has(offeringKey(offering.courseId, offering.section))
	).length;

	const changes = new Map<string, TimetableItemChangeReason>();
	const professorChanges: Array<{ offeringId: string; label: string }> = [];
	for (const incoming of result.offerings) {
		const existing = existingByKey.get(offeringKey(incoming.courseId, incoming.section));
		if (!existing) continue;
		const change = compareOfferingImport(existing, incoming);
		if (change.reason) changes.set(existing.id, change.reason);
		if (change.professorsChanged) {
			professorChanges.push({
				offeringId: existing.id,
				label: `${existing.courseId}-${existing.section}`
			});
		}
	}
	for (const existing of existingOfferings) {
		if (
			existing.archivedAt === null &&
			!incomingKeys.has(offeringKey(existing.courseId, existing.section))
		) {
			changes.set(existing.id, 'cancelled');
		}
	}

	const reviewedProfessorChanges = await ReviewRepository.findOfferingIdsWithReviews(
		professorChanges.map(({ offeringId }) => offeringId)
	);
	if (reviewedProfessorChanges.size) {
		const labels = professorChanges
			.filter(({ offeringId }) => reviewedProfessorChanges.has(offeringId))
			.map(({ label }) => label)
			.join(', ');
		throw new AppError(
			APP_ERROR.CONFLICT,
			`${labels}에는 이미 작성된 강의평가가 있어 담당 교원을 자동 변경할 수 없습니다.`
		);
	}

	const confirmationBreakingOfferingIds = [...changes]
		.filter(([, reason]) => reason === 'schedule_changed' || reason === 'cancelled')
		.map(([offeringId]) => offeringId);
	let unconfirmedTimetableCount = 0;
	await transaction(async () => {
		await OfferingRepository.archiveOfferings(year, term, result.academicCareer);
		for (const value of result.offerings) await OfferingRepository.upsertOfferingImport(value);
		await TimetableRepository.markOfferingChanges(changes);
		unconfirmedTimetableCount = await TimetableRepository.unconfirmTimetablesContainingOfferings(
			confirmationBreakingOfferingIds
		);
	});

	const changeCounts = { scheduleChanged: 0, cancelled: 0, detailsChanged: 0 };
	for (const reason of changes.values()) {
		if (reason === 'schedule_changed') changeCounts.scheduleChanged += 1;
		else if (reason === 'cancelled') changeCounts.cancelled += 1;
		else changeCounts.detailsChanged += 1;
	}
	return {
		academicCareer: result.academicCareer,
		importedCount: result.offerings.length,
		skippedClosedCount: result.skippedClosedCount,
		passCreditCount: result.passCreditCount,
		multipleProfessorCount: result.multipleProfessorCount,
		newOfferingCount,
		...changeCounts,
		unconfirmedTimetableCount
	};
}
