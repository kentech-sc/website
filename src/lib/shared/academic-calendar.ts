import type { ScheduleEntry } from '$lib/types/academic-calendar.type.js';

/** 학교 포털 학사일정 응답. 비어 오는 달이 있어 모두 선택적으로 다룬다. */
export interface CalendarResponseBody {
	calendarDate?: string;
	calendarList?: unknown;
}

interface CalendarRow {
	start_day?: string;
	end_day?: string;
	subject?: string;
}

export function parseSchedule(body: CalendarResponseBody): ScheduleEntry[] {
	const rows = Array.isArray(body.calendarList) ? (body.calendarList as CalendarRow[]) : [];

	return rows
		.filter((row): row is Required<CalendarRow> =>
			Boolean(row?.start_day && row?.end_day && row?.subject)
		)
		.map((row) => ({
			startDay: row.start_day,
			endDay: row.end_day,
			subject: row.subject
		}));
}

/**
 * 기간 일정은 걸치는 달마다 응답에 실려 오므로,
 * 여러 달을 합칠 때 같은 일정이 겹쳐 들어온다.
 */
export function dedupeEntries(entries: ScheduleEntry[]): ScheduleEntry[] {
	const seen = new Set<string>();
	const result: ScheduleEntry[] = [];

	for (const entry of entries) {
		const key = `${entry.startDay}|${entry.endDay}|${entry.subject}`;
		if (seen.has(key)) continue;
		seen.add(key);
		result.push(entry);
	}

	return result;
}

/** 하루짜리인지 기간짜리인지. 기간 일정은 화면에서 따로 다룬다. */
export function isSpan(entry: ScheduleEntry): boolean {
	return entry.startDay !== entry.endDay;
}

/** 해당 날짜에 걸치는 일정. 기간 일정은 시작~종료 사이 모든 날에 걸린다. */
export function entriesOn(entries: ScheduleEntry[], dayKey: string): ScheduleEntry[] {
	return entries.filter((entry) => entry.startDay <= dayKey && dayKey <= entry.endDay);
}

/** 주어진 구간과 하루라도 겹치는 일정. */
export function entriesInRange(
	entries: ScheduleEntry[],
	startDay: string,
	endDay: string
): ScheduleEntry[] {
	return entries.filter((entry) => entry.startDay <= endDay && entry.endDay >= startDay);
}

export function sortEntries(entries: ScheduleEntry[]): ScheduleEntry[] {
	return [...entries].sort(
		(a, b) => a.startDay.localeCompare(b.startDay) || a.endDay.localeCompare(b.endDay)
	);
}
