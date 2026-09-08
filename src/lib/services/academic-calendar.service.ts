import type { ScheduleEntry } from '$lib/types/academic-calendar.type.js';

import { parseSchedule, type CalendarResponseBody } from '$lib/shared/academic-calendar.js';

const CALENDAR_URL = 'https://my.kentech.ac.kr/kentech/FixedAreaCalendar.eps';

/**
 * 학교 포털은 월 단위로만 응답한다. 그 달에 걸치는 기간 일정도 함께 실려 온다.
 * @param monthKey YYYY-MM
 */
export async function fetchMonthSchedule(monthKey: string): Promise<ScheduleEntry[]> {
	const response = await fetch(CALENDAR_URL, {
		method: 'POST',
		headers: {
			'content-type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			direction: '',
			calendarDate: `${monthKey}-01`
		})
	});

	if (!response.ok) {
		throw new Error('학사일정을 불러오지 못했습니다.');
	}

	const body = (await response.json()) as CalendarResponseBody;
	return parseSchedule(body);
}
