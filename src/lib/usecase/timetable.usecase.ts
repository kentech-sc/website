import type { User } from '$lib/types/user.type.js';

import * as AcademicRepository from '$lib/repositories/academic.repository.js';
import * as TimetableRepository from '$lib/repositories/timetable.repository.js';
import { transaction } from '$lib/server/db.js';
import * as TimetableService from '$lib/services/timetable.service.js';
import { calculateDegreeProgress, getCourseSequenceProgress } from '$lib/shared/degree.js';
import { hasCapability } from '$lib/shared/permission.js';

export async function getPage(year: number, term: number, user: User) {
	const [
		offerings,
		historicalOfferings,
		timetables,
		profile,
		completedDegreeCourses,
		completionViews,
		competition
	] = await Promise.all([
		AcademicRepository.findOfferings(year, term),
		AcademicRepository.findOfferingsIncludingArchived(year, term),
		TimetableRepository.findTimetables(user.id, year, term),
		AcademicRepository.findAcademicProfile(user.id),
		AcademicRepository.findCompletedDegreeCourses(user.id),
		AcademicRepository.findCompletionViews(user.id, year, term),
		TimetableRepository.findConfirmedCompetition(user.id, year, term)
	]);
	const policy = profile
		? await AcademicRepository.findGraduationPolicy(profile.admissionYear)
		: null;
	const completedCourseIds = new Set(
		completedDegreeCourses
			.map((course) => course.code)
			.filter((courseId) => !courseId.startsWith('EXT:'))
	);
	const espSequence = policy?.rules.courseSequences?.find((item) => item.category === 'ESP');
	const availableEspCourseIds = espSequence
		? new Set(
				getCourseSequenceProgress(
					espSequence,
					completedCourseIds,
					profile?.espWaivedCourseIds ?? []
				).availableCourseIds
			)
		: new Set<string>();
	const offeringRestrictions = Object.fromEntries(
		offerings.flatMap((offering) => {
			let reason: string | null = null;
			if (completedCourseIds.has(offering.courseId)) reason = '이수 완료';
			else if (offering.category === 'ESP' && !profile) reason = 'ESP 정보 필요';
			else if (offering.category === 'ESP' && !espSequence) reason = 'ESP 정책 확인 필요';
			else if (offering.category === 'ESP' && !availableEspCourseIds.has(offering.courseId))
				reason = 'ESP 단계 제한';
			return reason ? [[offering.id, reason]] : [];
		})
	);
	const baseDegreeProgress = policy
		? calculateDegreeProgress(completedDegreeCourses, policy.rules, {
				ESP: profile?.espWaivedCourseIds ?? []
			})
		: null;
	const timetableProgress = policy
		? Object.fromEntries(
				timetables.map((timetable) => [
					timetable.id,
					calculateDegreeProgress(
						[
							...completedDegreeCourses,
							...timetable.offerings.map((offering) => ({
								code: offering.courseId,
								category: offering.category,
								subcategory: offering.subcategory,
								level: offering.level,
								credits: offering.credits,
								gradExcluded: offering.gradExcluded
							}))
						],
						policy.rules,
						{ ESP: profile?.espWaivedCourseIds ?? [] }
					)
				])
			)
		: {};
	const offeringsByCourse = new Map<string, typeof historicalOfferings>();
	for (const offering of historicalOfferings)
		offeringsByCourse.set(offering.courseId, [
			...(offeringsByCourse.get(offering.courseId) ?? []),
			offering
		]);
	const actualOfferingMap = new Map<string, (typeof historicalOfferings)[number]>();
	const unscheduledCompletions: typeof completionViews = [];
	for (const completion of completionViews) {
		const exactOffering = completion.offering;
		const candidates = offeringsByCourse.get(completion.courseCode) ?? [];
		const resolvedOffering = exactOffering ?? (candidates.length === 1 ? candidates[0] : null);
		const appearsOnWeekdayGrid = resolvedOffering?.meetings.some(
			(meeting) => meeting.weekday >= 1 && meeting.weekday <= 5
		);
		if (resolvedOffering && appearsOnWeekdayGrid)
			actualOfferingMap.set(resolvedOffering.id, resolvedOffering);
		else unscheduledCompletions.push(completion);
	}
	return {
		offerings,
		timetables,
		actualSchedule: {
			completions: completionViews,
			offerings: [...actualOfferingMap.values()],
			unscheduledCompletions
		},
		degreeProgress: baseDegreeProgress,
		timetableProgress,
		competition,
		offeringRestrictions,
		canManageCatalog: hasCapability(user, 'course.manage')
	};
}

export const create = (year: number, term: number, name: string, user: User) =>
	TimetableService.create(year, term, name, user);
export const addOffering = (id: string, offeringId: string, user: User) =>
	transaction(() => TimetableService.addOffering(id, offeringId, user));
export const removeOffering = (id: string, offeringId: string, user: User) =>
	transaction(() => TimetableService.removeOffering(id, offeringId, user));
export const copy = (id: string, user: User) => transaction(() => TimetableService.copy(id, user));
export const confirm = (id: string, user: User) =>
	transaction(() => TimetableService.confirm(id, user));
export const unconfirm = (id: string, user: User) =>
	transaction(() => TimetableService.unconfirm(id, user));
export const rename = (id: string, name: string, user: User) =>
	TimetableService.rename(id, name, user);
export const remove = (id: string, user: User) =>
	transaction(() => TimetableService.remove(id, user));
