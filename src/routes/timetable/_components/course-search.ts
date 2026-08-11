export type CourseSearchFilter =
	| { kind: 'all' }
	| { kind: 'slot'; weekday: number; startsAt: number; endsAt: number }
	| {
			kind: 'replace';
			sourceOfferingId: string;
			meetingId: string;
			weekday: number;
			startsAt: number;
			endsAt: number;
	  }
	| { kind: 'unscheduled' };

export interface SearchableMeeting {
	weekday: number;
	startsAt: number;
	endsAt: number;
}

export interface TimeBlock {
	startsAt: number;
	endsAt: number;
}

/** 기본 강의 추가 시간대. 점심시간을 포함하며, 실제로 비어 있는 구간에 버튼을 표시한다. */
export const COURSE_SLOTS: readonly TimeBlock[] = [
	{ startsAt: 9 * 60, endsAt: 11 * 60 },
	{ startsAt: 11 * 60, endsAt: 12 * 60 },
	{ startsAt: 12 * 60, endsAt: 14 * 60 },
	{ startsAt: 14 * 60, endsAt: 16 * 60 },
	{ startsAt: 16 * 60, endsAt: 18 * 60 },
	{ startsAt: 18 * 60, endsAt: 20 * 60 }
];

export function overlapsTimeRange(
	meeting: SearchableMeeting,
	range: { weekday: number; startsAt: number; endsAt: number }
): boolean {
	return (
		meeting.weekday === range.weekday &&
		meeting.startsAt < range.endsAt &&
		range.startsAt < meeting.endsAt
	);
}

/** 블록에서 이미 점유된 시간을 빼고, 사용자가 선택할 수 있는 연속된 빈 구간을 반환한다. */
export function getFreeTimeRanges(
	weekday: number,
	block: TimeBlock,
	meetings: SearchableMeeting[]
): TimeBlock[] {
	const occupied = meetings
		.filter((meeting) => overlapsTimeRange(meeting, { weekday, ...block }))
		.map((meeting) => ({
			startsAt: Math.max(block.startsAt, meeting.startsAt),
			endsAt: Math.min(block.endsAt, meeting.endsAt)
		}))
		.sort((a, b) => a.startsAt - b.startsAt || a.endsAt - b.endsAt);

	const free: TimeBlock[] = [];
	let cursor = block.startsAt;
	for (const range of occupied) {
		if (range.startsAt > cursor) free.push({ startsAt: cursor, endsAt: range.startsAt });
		cursor = Math.max(cursor, range.endsAt);
		if (cursor >= block.endsAt) break;
	}
	if (cursor < block.endsAt) free.push({ startsAt: cursor, endsAt: block.endsAt });
	return free;
}

export function matchesCourseSearchFilter(
	meetings: SearchableMeeting[],
	filter: CourseSearchFilter
): boolean {
	if (filter.kind === 'all') return true;
	if (filter.kind === 'unscheduled')
		return !meetings.some((meeting) => meeting.weekday >= 1 && meeting.weekday <= 5);
	return meetings.some((meeting) => overlapsTimeRange(meeting, filter));
}
