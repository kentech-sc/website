/**
 * 달력 안(격자 / 목록)을 비교하기 위한 임시 데이터와 계산 함수.
 * 학교 포털 학사일정(FixedAreaCalendar.eps) 응답을 그대로 옮겨둔 것으로,
 * 실제 연동을 붙이면 이 파일은 지운다.
 */
export interface ScheduleEntry {
	startDay: string;
	endDay: string;
	subject: string;
}

/** 하루짜리인지 기간짜리인지 구분한다. 기간 일정은 화면에서 따로 다룬다. */
export function isSpan(entry: ScheduleEntry): boolean {
	return entry.startDay !== entry.endDay;
}

export const sampleSchedule: ScheduleEntry[] = [
	{ startDay: '2026-06-20', endDay: '2026-08-30', subject: '하계방학' },
	{ startDay: '2026-08-18', endDay: '2026-08-20', subject: '2학기 등록(등록금 납부)' },
	{ startDay: '2026-08-21', endDay: '2026-08-21', subject: '졸업식' },
	{ startDay: '2026-08-30', endDay: '2026-08-30', subject: '졸업기준일' },
	{ startDay: '2026-08-31', endDay: '2026-08-31', subject: '2학기 시작일' },
	{ startDay: '2026-08-31', endDay: '2026-08-31', subject: '개강' },
	{ startDay: '2026-08-31', endDay: '2026-09-04', subject: '2학기 수강신청 정정' },
	{ startDay: '2026-09-07', endDay: '2026-09-11', subject: '졸업 신청(조기졸업 포함)' },
	{ startDay: '2026-09-17', endDay: '2026-09-23', subject: '2학기 수강취소 신청' }
];

/** 이번 주 월요일부터 14일간의 날짜 목록. */
export function getTwoWeekDays(today: Date = new Date()): Date[] {
	const monday = new Date(today);
	monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

	return Array.from({ length: 14 }, (_, offset) => {
		const date = new Date(monday);
		date.setDate(monday.getDate() + offset);
		return date;
	});
}

/** 이번 달 1일부터 말일까지의 날짜 목록. */
export function getMonthDays(today: Date = new Date()): Date[] {
	const year = today.getFullYear();
	const month = today.getMonth();
	const lastDate = new Date(year, month + 1, 0).getDate();

	return Array.from({ length: lastDate }, (_, offset) => new Date(year, month, offset + 1));
}

export function toDayKey(date: Date): string {
	const month = `${date.getMonth() + 1}`.padStart(2, '0');
	const day = `${date.getDate()}`.padStart(2, '0');
	return `${date.getFullYear()}-${month}-${day}`;
}

/** 해당 날짜에 걸치는 일정을 고른다. (기간 일정은 시작~종료 사이 모든 날에 걸린다) */
export function entriesOn(entries: ScheduleEntry[], dayKey: string): ScheduleEntry[] {
	return entries.filter((entry) => entry.startDay <= dayKey && dayKey <= entry.endDay);
}
