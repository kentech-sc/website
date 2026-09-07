/**
 * 날짜를 'YYYY-MM-DD' 문자열(day key)로만 다루는 유틸.
 *
 * Date 의 getDate()/getDay() 는 실행 환경 타임존을 따르기 때문에,
 * 같은 순간에도 서버(Vercel=UTC)와 브라우저(KST)에서 다른 날짜가 나온다.
 * 그래서 "오늘"은 KST 로 한 번만 정하고 이후 계산은 전부 UTC 기준으로 해,
 * 어디서 실행하든 같은 결과가 나오게 한다.
 */

const DAY_MS = 86_400_000;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 지금 이 순간의 한국 날짜. 'YYYY-MM-DD' */
export function getKstDayKey(now: Date = new Date()): string {
	return new Date(now.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

/** 'YYYY-MM-DD' -> 'YYYYMMDD' (학교 포털 학식 API 가 쓰는 형식) */
export function toCompactDayKey(dayKey: string): string {
	return dayKey.replaceAll('-', '');
}

/** 'YYYYMMDD' -> 'YYYY-MM-DD' */
export function fromCompactDayKey(compact: string): string {
	return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
}

function toUtcDate(dayKey: string): Date {
	return new Date(`${dayKey}T00:00:00.000Z`);
}

export function addDays(dayKey: string, days: number): string {
	return new Date(toUtcDate(dayKey).getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

/** 0=일요일 … 6=토요일 */
export function getWeekdayIndex(dayKey: string): number {
	return toUtcDate(dayKey).getUTCDay();
}

export function getDayOfMonth(dayKey: string): number {
	return Number(dayKey.slice(8, 10));
}

export function getMonthOfDay(dayKey: string): number {
	return Number(dayKey.slice(5, 7));
}

/** 'YYYY-MM' — 학사일정 API 가 월 단위로 응답해 캐시 키로도 쓴다. */
export function toMonthKey(dayKey: string): string {
	return dayKey.slice(0, 7);
}

/**
 * 그 달의 몇 번째 주인지. 달의 첫 주가 며칠뿐이어도 1주차로 센다.
 * (예: 2026-09-01 이 화요일이라 9/7 은 2주차)
 */
export function getWeekOfMonth(dayKey: string): number {
	const firstWeekday = (getWeekdayIndex(`${toMonthKey(dayKey)}-01`) + 6) % 7;
	return Math.floor((getDayOfMonth(dayKey) - 1 + firstWeekday) / 7) + 1;
}

/** 기준일이 속한 달의 1일. 월 단위로 이동할 때의 기준점이 된다. */
export function toMonthStart(dayKey: string): string {
	return `${toMonthKey(dayKey)}-01`;
}

/** 달을 옮긴다. 항상 1일로 맞춰 말일 차이(1/31 -> 2/31)를 피한다. */
export function addMonths(dayKey: string, months: number): string {
	const year = Number(dayKey.slice(0, 4));
	const month = Number(dayKey.slice(5, 7)) - 1 + months;
	const shiftedYear = year + Math.floor(month / 12);
	const shiftedMonth = ((month % 12) + 12) % 12;
	return `${shiftedYear}-${`${shiftedMonth + 1}`.padStart(2, '0')}-01`;
}

/** 기준일이 속한 주의 월요일부터 14일. */
export function getTwoWeekDayKeys(todayKey: string): string[] {
	const weekday = getWeekdayIndex(todayKey);
	const monday = addDays(todayKey, -((weekday + 6) % 7));
	return Array.from({ length: 14 }, (_, offset) => addDays(monday, offset));
}

/** 기준일이 속한 달의 1일부터 말일까지. */
export function getMonthDayKeys(todayKey: string): string[] {
	const first = `${toMonthKey(todayKey)}-01`;
	const days: string[] = [];
	for (let day = first; toMonthKey(day) === toMonthKey(first); day = addDays(day, 1)) {
		days.push(day);
	}
	return days;
}
