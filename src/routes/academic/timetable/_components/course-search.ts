export type CourseSearchFilter =
	| { kind: 'all' }
	| { kind: 'slot'; weekday: number; startMinute: number; endMinute: number }
	| {
			kind: 'replace';
			sourceOfferingId: string;
			meetingId: string;
			weekday: number;
			startMinute: number;
			endMinute: number;
	  }
	| { kind: 'unscheduled' };

export interface SearchableMeeting {
	weekday: number;
	startMinute: number;
	endMinute: number;
}

export interface TimeBlock {
	startMinute: number;
	endMinute: number;
}

/** 기본 강의 추가 시간대. 점심시간을 포함하며, 실제로 비어 있는 구간에 버튼을 표시한다. */
export const COURSE_SLOTS: readonly TimeBlock[] = [
	{ startMinute: 9 * 60, endMinute: 11 * 60 },
	{ startMinute: 11 * 60, endMinute: 12 * 60 },
	{ startMinute: 12 * 60, endMinute: 14 * 60 },
	{ startMinute: 14 * 60, endMinute: 16 * 60 },
	{ startMinute: 16 * 60, endMinute: 18 * 60 },
	{ startMinute: 18 * 60, endMinute: 20 * 60 },
	{ startMinute: 20 * 60, endMinute: 21 * 60 }
];

export function overlapsTimeRange(
	meeting: SearchableMeeting,
	range: { weekday: number; startMinute: number; endMinute: number }
): boolean {
	return (
		meeting.weekday === range.weekday &&
		meeting.startMinute < range.endMinute &&
		range.startMinute < meeting.endMinute
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
			startMinute: Math.max(block.startMinute, meeting.startMinute),
			endMinute: Math.min(block.endMinute, meeting.endMinute)
		}))
		.sort((a, b) => a.startMinute - b.startMinute || a.endMinute - b.endMinute);

	const free: TimeBlock[] = [];
	let cursor = block.startMinute;
	for (const range of occupied) {
		if (range.startMinute > cursor)
			free.push({ startMinute: cursor, endMinute: range.startMinute });
		cursor = Math.max(cursor, range.endMinute);
		if (cursor >= block.endMinute) break;
	}
	if (cursor < block.endMinute) free.push({ startMinute: cursor, endMinute: block.endMinute });
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
