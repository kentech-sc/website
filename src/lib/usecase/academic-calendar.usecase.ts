import type { AcademicSchedule, ScheduleEntry } from '$lib/types/academic-calendar.type.js';

import * as AcademicCalendarService from '$lib/services/academic-calendar.service.js';
import { dedupeEntries, sortEntries } from '$lib/shared/academic-calendar.js';
import {
	getKstDayKey,
	getMonthDayKeys,
	getTwoWeekDayKeys,
	toMonthKey
} from '$lib/shared/day-key.js';

/**
 * 학사일정은 학기 단위로 정해져 거의 바뀌지 않는데,
 * 캐시가 없으면 홈을 열 때마다 학교 포털을 부르게 된다.
 */
const CACHE_TTL_MS = 30 * 60 * 1000;

const monthCache = new Map<string, { fetchedAt: number; entries: ScheduleEntry[] }>();

async function getMonthEntries(monthKey: string): Promise<ScheduleEntry[]> {
	const cached = monthCache.get(monthKey);
	if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
		return cached.entries;
	}

	const entries = await AcademicCalendarService.fetchMonthSchedule(monthKey);
	monthCache.set(monthKey, { fetchedAt: Date.now(), entries });
	return entries;
}

/**
 * 화면(2주 격자 / 한 달 목록)이 필요로 하는 달을 모두 가져와 합친다.
 * 2주 창이 달을 넘어가면 두 달이 필요하다.
 */
export async function getSchedule(todayKey: string = getKstDayKey()): Promise<AcademicSchedule> {
	const neededDays = [...getMonthDayKeys(todayKey), ...getTwoWeekDayKeys(todayKey)];
	const monthKeys = [...new Set(neededDays.map(toMonthKey))];

	const monthResults = await Promise.all(monthKeys.map(getMonthEntries));
	const entries = sortEntries(dedupeEntries(monthResults.flat()));

	return { today: todayKey, entries };
}

/**
 * 홈 화면은 학사일정이 없어도 떠야 하므로 실패를 삼킨다.
 * 학교 포털이 느리거나 응답하지 않을 때 메인 전체가 함께 멈추지 않도록 한다.
 */
export async function getScheduleOrNull(
	todayKey: string = getKstDayKey()
): Promise<AcademicSchedule | null> {
	try {
		return await getSchedule(todayKey);
	} catch {
		return null;
	}
}
