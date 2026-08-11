export type CourseSearchFilter =
	| { kind: 'all' }
	| { kind: 'slot'; weekday: number; startsAt: number; endsAt: number }
	| { kind: 'unscheduled' };

export interface SearchableMeeting {
	weekday: number;
	startsAt: number;
	endsAt: number;
}

export interface TimeBlock {
	startsAt: number;
	endsAt: number;
	/** 학부 정규 블럭. 비어 있으면 + 버튼을 상시 노출한다. 점심 블럭은 대학원 강의용 보조라 제외. */
	primary: boolean;
}

/** 시간표 격자의 강의 블럭. 학부 강의는 이 경계에 맞춰 열린다. */
export const COURSE_SLOTS: readonly TimeBlock[] = [
	{ startsAt: 9 * 60, endsAt: 11 * 60, primary: true },
	{ startsAt: 11 * 60, endsAt: 12 * 60, primary: false },
	{ startsAt: 12 * 60, endsAt: 14 * 60, primary: true },
	{ startsAt: 14 * 60, endsAt: 16 * 60, primary: true },
	{ startsAt: 16 * 60, endsAt: 18 * 60, primary: true },
	{ startsAt: 18 * 60, endsAt: 20 * 60, primary: true }
];

/**
 * 블럭과 조금이라도 겹치면 그 블럭 검색에 포함한다.
 * 대학원 강의는 90분 단위라 블럭 경계에 맞지 않고, 두 블럭에 걸치면 양쪽에서 검색된다.
 * 경계가 맞닿기만 한 경우(18:00에 끝나는 블럭과 18:00에 시작하는 강의)는 겹치지 않는다.
 */
export function overlapsBlock(
	meeting: SearchableMeeting,
	block: { weekday: number; startsAt: number; endsAt: number }
): boolean {
	return (
		meeting.weekday === block.weekday &&
		meeting.startsAt < block.endsAt &&
		block.startsAt < meeting.endsAt
	);
}

export function matchesCourseSearchFilter(
	meetings: SearchableMeeting[],
	filter: CourseSearchFilter
): boolean {
	if (filter.kind === 'all') return true;
	if (filter.kind === 'unscheduled')
		return !meetings.some((meeting) => meeting.weekday >= 1 && meeting.weekday <= 5);
	return meetings.some((meeting) => overlapsBlock(meeting, filter));
}
