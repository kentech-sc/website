import { json } from '@sveltejs/kit';

import { addMonths, getKstDayKey, toMonthKey } from '$lib/shared/day-key.js';
import * as AcademicCalendarUsecase from '$lib/usecase/academic-calendar.usecase.js';

/** 앞뒤로 옮길 수 있는 범위(개월). 학교 포털에 먼 달을 반복 요청하지 않도록 제한한다. */
const MONTH_RANGE = 12;

function isDateFormat(value: string): boolean {
	return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isWithinRange(dayKey: string): boolean {
	const today = getKstDayKey();
	const oldest = toMonthKey(addMonths(today, -MONTH_RANGE));
	const newest = toMonthKey(addMonths(today, MONTH_RANGE));
	const target = toMonthKey(dayKey);
	return oldest <= target && target <= newest;
}

export const GET = async ({ url }) => {
	const date = url.searchParams.get('date') ?? getKstDayKey();

	if (!isDateFormat(date)) {
		return json({ message: '날짜 형식이 올바르지 않습니다.' }, { status: 400 });
	}

	if (!isWithinRange(date)) {
		return json({ message: `앞뒤 ${MONTH_RANGE}개월까지만 볼 수 있습니다.` }, { status: 400 });
	}

	const schedule = await AcademicCalendarUsecase.getScheduleOrNull(date);

	if (!schedule) {
		return json({ message: '학사일정을 불러오지 못했습니다.' }, { status: 502 });
	}

	return json(schedule);
};
