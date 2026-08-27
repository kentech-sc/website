import { matchesCourseSearchFilter, overlapsTimeRange } from './course-search.ts';

import type { Offering } from '$lib/types/academic.type.js';
import type { CourseSearchFilter } from './course-search.ts';

export interface CourseSearchModelInput {
	offerings: Offering[];
	selectedOfferings: Offering[];
	offeringRestrictions: Record<string, string>;
	offeringNotices: Record<string, string>;
	filter: CourseSearchFilter;
	query: string;
	category: string;
}

export interface OfferingRestriction {
	label: string;
	order: number;
}

const weekdays = ['월', '화', '수', '목', '금'];

const formatTime = (minutes: number) =>
	`${Math.floor(minutes / 60)
		.toString()
		.padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}`;

export const buildCourseSearchModel = ({
	offerings,
	selectedOfferings,
	offeringRestrictions,
	offeringNotices,
	filter,
	query,
	category
}: CourseSearchModelInput) => {
	const selectedOfferingIds = new Set(selectedOfferings.map((offering) => offering.id));
	const sourceOffering =
		filter.kind === 'replace'
			? (selectedOfferings.find((offering) => offering.id === filter.sourceOfferingId) ?? null)
			: null;

	const hasConflict = (offering: Offering) =>
		offering.meetings.some((candidate) =>
			selectedOfferings.some(
				(selectedOffering) =>
					selectedOffering.id !== offering.id &&
					(filter.kind !== 'replace' || selectedOffering.id !== filter.sourceOfferingId) &&
					selectedOffering.meetings.some(
						(meeting) =>
							meeting.weekday === candidate.weekday &&
							meeting.startsAt < candidate.endsAt &&
							candidate.startsAt < meeting.endsAt
					)
			)
		);

	const restrictionFor = (
		offering: Offering,
		alreadyAdded: boolean
	): OfferingRestriction | null => {
		if (alreadyAdded && filter.kind !== 'replace') return null;
		if (
			filter.kind !== 'replace' &&
			selectedOfferings.some((item) => item.courseId === offering.courseId)
		)
			return { label: '대체 분반', order: 0 };
		if (hasConflict(offering)) return { label: '시간 겹침', order: 1 };
		const catalogReason = offeringRestrictions[offering.id];
		return catalogReason ? { label: catalogReason, order: 2 } : null;
	};

	const noticeFor = (offering: Offering) => offeringNotices[offering.id] ?? null;

	const matchesContext = (offering: Offering) => {
		if (filter.kind !== 'replace') return matchesCourseSearchFilter(offering.meetings, filter);
		if (
			!sourceOffering ||
			offering.id === sourceOffering.id ||
			selectedOfferingIds.has(offering.id)
		)
			return false;
		return (
			offering.courseId === sourceOffering.courseId ||
			offering.meetings.some((meeting) => overlapsTimeRange(meeting, filter))
		);
	};

	const rank = (offering: Offering) => {
		if (filter.kind !== 'replace' && selectedOfferingIds.has(offering.id)) return 0;
		const careerRank = offering.academicCareer === 'graduate' ? 1 : 0;
		const containedRank =
			filter.kind === 'replace' &&
			offering.meetings.some(
				(meeting) =>
					meeting.weekday === filter.weekday &&
					meeting.startsAt >= filter.startsAt &&
					meeting.endsAt <= filter.endsAt
			)
				? 0
				: 1;
		const restriction = restrictionFor(offering, false);
		if (restriction) return 10 + restriction.order * 2 + careerRank;
		return containedRank * 2 + careerRank + (noticeFor(offering) ? 4 : 0);
	};

	const normalizedQuery = query.trim().toLowerCase();
	const filteredOfferings = offerings
		.filter(matchesContext)
		.filter((offering) => {
			const searchText =
				`${offering.courseId} ${offering.courseName} ${offering.subtitle ?? ''} ${offering.professors.map((professor) => professor.name).join(' ')}`.toLowerCase();
			return (
				searchText.includes(normalizedQuery) &&
				(category === 'all' || offering.category === category)
			);
		})
		.sort((a, b) => rank(a) - rank(b));

	const contextLabel =
		filter.kind === 'slot' || filter.kind === 'replace'
			? `${weekdays[filter.weekday - 1]} ${formatTime(filter.startsAt)}–${formatTime(filter.endsAt)} 기준`
			: null;
	const filterLabel =
		filter.kind === 'unscheduled'
			? '시간 미정'
			: filter.kind === 'slot'
				? `${weekdays[filter.weekday - 1]} ${formatTime(filter.startsAt)}`
				: null;

	return {
		availableCategories: [
			...new Set(offerings.map((offering) => offering.category).filter(Boolean))
		].sort() as string[],
		selectedOfferingIds,
		sourceOffering,
		filteredOfferings,
		sectionReplacements:
			filter.kind === 'replace' && sourceOffering
				? filteredOfferings.filter((offering) => offering.courseId === sourceOffering.courseId)
				: [],
		timeReplacements:
			filter.kind === 'replace' && sourceOffering
				? filteredOfferings.filter((offering) => offering.courseId !== sourceOffering.courseId)
				: [],
		contextLabel,
		filterLabel,
		restrictionFor,
		noticeFor
	};
};
