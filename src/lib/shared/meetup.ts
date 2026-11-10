import type { MeetupMode } from '$lib/types/meetup.type.js';

/**
 * 일정 조율의 칸 계산. 칸 번호는 `날짜 순번 * 하루 칸 수 + 그날의 칸 순번`이다.
 * 날짜·시간 범위가 칸 번호의 기준이므로 조율을 만든 뒤에는 둘을 바꾸지 않는다.
 */

export const MEETUP_SLOT_MINUTES = 30;
export const MEETUP_MAX_DAYS = 14;
export const MEETUP_TITLE_MAX_LENGTH = 60;

/** weekday 는 시간표와 같이 1(월)~7(일)이다. */
export const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

export interface SlotCell {
	day: number;
	slot: number;
}

export interface BusyMeeting {
	weekday: number;
	startMinute: number;
	endMinute: number;
}

export function getSlotsPerDay(startMinute: number, endMinute: number): number {
	return (endMinute - startMinute) / MEETUP_SLOT_MINUTES;
}

export function getSlotIndex(cell: SlotCell, slotsPerDay: number): number {
	return cell.day * slotsPerDay + cell.slot;
}

export function isDateKey(value: string): boolean {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const date = new Date(`${value}T00:00:00Z`);
	return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function isWeekdayKey(value: string): boolean {
	return /^[1-7]$/.test(value);
}

/** 날짜 모드는 'YYYY-MM-DD', 요일 모드는 '1'~'7'. 중복을 지우고 정렬한다. 잘못되면 null. */
export function normalizeMeetupDays(mode: MeetupMode, days: string[]): string[] | null {
	const isValid = mode === 'dates' ? isDateKey : isWeekdayKey;
	const uniqueDays = [...new Set(days.map((day) => day.trim()))];
	if (!uniqueDays.length || uniqueDays.length > MEETUP_MAX_DAYS) return null;
	if (!uniqueDays.every(isValid)) return null;
	return uniqueDays.sort();
}

/** 범위를 벗어난 칸이 하나라도 있으면 null. 중복을 지우고 정렬한다. */
export function normalizeSlots(slots: number[], totalSlots: number): number[] | null {
	if (!slots.every((slot) => Number.isInteger(slot) && slot >= 0 && slot < totalSlots)) {
		return null;
	}
	return [...new Set(slots)].sort((a, b) => a - b);
}

export function getDayWeekday(mode: MeetupMode, day: string): number {
	if (mode === 'weekdays') return Number(day);
	const sundayBased = new Date(`${day}T00:00:00Z`).getUTCDay();
	return ((sundayBased + 6) % 7) + 1;
}

/** 드래그로 만든 직사각형을 기존 선택에 더하거나 뺀다. */
export function applySlotRect(
	selected: ReadonlySet<number>,
	anchor: SlotCell,
	current: SlotCell,
	mode: 'add' | 'remove',
	slotsPerDay: number
): Set<number> {
	const next = new Set(selected);
	const [dayFrom, dayTo] = [anchor.day, current.day].sort((a, b) => a - b);
	const [slotFrom, slotTo] = [anchor.slot, current.slot].sort((a, b) => a - b);
	for (let day = dayFrom; day <= dayTo; day += 1) {
		for (let slot = slotFrom; slot <= slotTo; slot += 1) {
			const index = getSlotIndex({ day, slot }, slotsPerDay);
			if (mode === 'add') next.add(index);
			else next.delete(index);
		}
	}
	return next;
}

/** 칸마다 가능한 사람 수. */
export function countAvailability(
	responses: Array<{ slots: number[] }>,
	totalSlots: number
): number[] {
	const counts = new Array<number>(totalSlots).fill(0);
	for (const response of responses) {
		for (const slot of response.slots) {
			if (slot >= 0 && slot < totalSlots) counts[slot] += 1;
		}
	}
	return counts;
}

/** 응답한 사람 모두가 되는 칸. 두 명 이상 응답했을 때만 의미가 있다. */
export function findEveryoneSlots(counts: number[], total: number): Set<number> {
	const slots = new Set<number>();
	if (total < 2) return slots;
	counts.forEach((count, index) => {
		if (count === total) slots.add(index);
	});
	return slots;
}

export interface SlotRange {
	dayIndex: number;
	startMinute: number;
	endMinute: number;
}

/** 같은 날 이어진 칸을 하나의 시간 범위로 묶는다. 날짜·시간 순. */
export function groupSlotRanges(
	slots: ReadonlySet<number>,
	startMinute: number,
	endMinute: number
): SlotRange[] {
	const slotsPerDay = getSlotsPerDay(startMinute, endMinute);
	const ranges: SlotRange[] = [];
	for (const index of [...slots].sort((a, b) => a - b)) {
		const dayIndex = Math.floor(index / slotsPerDay);
		const slotStart = startMinute + (index % slotsPerDay) * MEETUP_SLOT_MINUTES;
		const last = ranges.at(-1);
		if (last && last.dayIndex === dayIndex && last.endMinute === slotStart) {
			last.endMinute += MEETUP_SLOT_MINUTES;
		} else {
			ranges.push({ dayIndex, startMinute: slotStart, endMinute: slotStart + MEETUP_SLOT_MINUTES });
		}
	}
	return ranges;
}

/** 시간표 수업과 조금이라도 겹치지 않는 칸. '내 시간표로 채우기'의 초안이다. */
export function findFreeSlots(
	mode: MeetupMode,
	days: string[],
	startMinute: number,
	endMinute: number,
	meetings: BusyMeeting[]
): Set<number> {
	const slotsPerDay = getSlotsPerDay(startMinute, endMinute);
	const free = new Set<number>();
	days.forEach((day, dayIndex) => {
		const weekday = getDayWeekday(mode, day);
		const dayMeetings = meetings.filter((meeting) => meeting.weekday === weekday);
		for (let slot = 0; slot < slotsPerDay; slot += 1) {
			const slotStart = startMinute + slot * MEETUP_SLOT_MINUTES;
			const slotEnd = slotStart + MEETUP_SLOT_MINUTES;
			const isBusy = dayMeetings.some(
				(meeting) => meeting.startMinute < slotEnd && slotStart < meeting.endMinute
			);
			if (!isBusy) free.add(getSlotIndex({ day: dayIndex, slot }, slotsPerDay));
		}
	});
	return free;
}

export function formatMinute(minute: number): string {
	const hour = Math.floor(minute / 60);
	return `${String(hour).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
}

/** 줄바꿈이 '~' 앞뒤에서 일어나지 않게 word joiner로 묶는다. */
export function formatTimeRange(startMinute: number, endMinute: number): string {
	return `${formatMinute(startMinute)}⁠~⁠${formatMinute(endMinute)}`;
}

/** 날짜 일정은 마지막 후보 날짜가 오늘보다 앞이면 지난 일정이다. 요일 일정은 지나지 않는다. */
export function isPastMeetup(mode: MeetupMode, days: string[], todayKey: string): boolean {
	return mode === 'dates' && days[days.length - 1] < todayKey;
}

export function formatMeetupDay(mode: MeetupMode, day: string): string {
	const weekdayLabel = WEEKDAY_LABELS[getDayWeekday(mode, day) - 1];
	if (mode === 'weekdays') return weekdayLabel;
	const [, month, date] = day.split('-');
	return `${Number(month)}/${Number(date)} (${weekdayLabel})`;
}

export function formatMeetupDays(mode: MeetupMode, days: string[]): string {
	if (mode === 'weekdays') return days.map((day) => formatMeetupDay(mode, day)).join('·');
	const first = formatMeetupDay(mode, days[0]);
	if (days.length === 1) return first;
	return `${first} 외 ${days.length - 1}일`;
}
