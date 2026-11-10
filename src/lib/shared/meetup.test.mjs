import assert from 'node:assert/strict';
import test from 'node:test';

import {
	applySlotRect,
	countAvailability,
	findEveryoneSlots,
	findFreeSlots,
	formatMeetupDay,
	formatMeetupDays,
	formatTimeRange,
	getDayWeekday,
	groupSlotRanges,
	isPastMeetup,
	normalizeMeetupDays,
	normalizeSlots
} from './meetup.ts';

function sorted(values) {
	return [...values].sort((a, b) => a - b);
}

test('날짜는 중복을 지우고 정렬하며, 없는 날짜는 거른다', () => {
	assert.deepEqual(normalizeMeetupDays('dates', ['2026-10-15', '2026-10-14', '2026-10-15']), [
		'2026-10-14',
		'2026-10-15'
	]);
	assert.equal(normalizeMeetupDays('dates', ['2026-02-30']), null);
	assert.equal(normalizeMeetupDays('dates', ['10/14']), null);
	assert.equal(normalizeMeetupDays('dates', []), null);
});

test('요일은 1~7 만 받는다', () => {
	assert.deepEqual(normalizeMeetupDays('weekdays', ['5', '1', '3']), ['1', '3', '5']);
	assert.equal(normalizeMeetupDays('weekdays', ['0']), null);
	assert.equal(normalizeMeetupDays('weekdays', ['8']), null);
});

test('조율 날짜는 14일까지다', () => {
	const days = Array.from(
		{ length: 15 },
		(_, index) => `2026-10-${String(index + 1).padStart(2, '0')}`
	);
	assert.equal(normalizeMeetupDays('dates', days), null);
	assert.equal(normalizeMeetupDays('dates', days.slice(0, 14))?.length, 14);
});

test('칸 번호가 하나라도 범위를 벗어나면 저장하지 않는다', () => {
	assert.deepEqual(normalizeSlots([3, 1, 3], 10), [1, 3]);
	assert.equal(normalizeSlots([10], 10), null);
	assert.equal(normalizeSlots([-1], 10), null);
	assert.equal(normalizeSlots([1.5], 10), null);
});

test('날짜의 요일을 월=1 기준으로 구한다', () => {
	assert.equal(getDayWeekday('dates', '2026-10-12'), 1);
	assert.equal(getDayWeekday('dates', '2026-10-18'), 7);
	assert.equal(getDayWeekday('weekdays', '3'), 3);
});

test('드래그한 직사각형을 더하고 뺀다', () => {
	const added = applySlotRect(new Set(), { day: 1, slot: 2 }, { day: 0, slot: 1 }, 'add', 4);
	assert.deepEqual(sorted(added), [1, 2, 5, 6]);

	const removed = applySlotRect(added, { day: 0, slot: 1 }, { day: 0, slot: 1 }, 'remove', 4);
	assert.deepEqual(sorted(removed), [2, 5, 6]);
});

test('칸마다 가능한 사람 수를 센다', () => {
	assert.deepEqual(countAvailability([{ slots: [0, 1] }, { slots: [1, 9] }], 3), [1, 2, 0]);
});

test('두 명 이상 응답했을 때 모두 되는 칸만 고른다', () => {
	assert.deepEqual(sorted(findEveryoneSlots([2, 1, 2, 0], 2)), [0, 2]);
	assert.equal(findEveryoneSlots([1, 1], 1).size, 0);
});

test('이어진 칸을 하루 단위 시간 범위로 묶는다', () => {
	// 09:00~10:30 하루 3칸 × 2일
	assert.deepEqual(groupSlotRanges(new Set([0, 1, 3, 5]), 540, 630), [
		{ dayIndex: 0, startMinute: 540, endMinute: 600 },
		{ dayIndex: 1, startMinute: 540, endMinute: 570 },
		{ dayIndex: 1, startMinute: 600, endMinute: 630 }
	]);
});

test('시간표 수업과 겹치는 칸만 빼고 채운다', () => {
	// 10/12(월)·10/13(화) 09:00~11:00, 월요일 09:30~10:30 수업
	const free = findFreeSlots('dates', ['2026-10-12', '2026-10-13'], 540, 660, [
		{ weekday: 1, startMinute: 570, endMinute: 630 }
	]);
	// 월요일 09:30~10:00, 10:00~10:30 두 칸만 빠진다
	assert.deepEqual(sorted(free), [0, 3, 4, 5, 6, 7]);
});

test('날짜와 요일을 읽기 좋게 보여준다', () => {
	assert.equal(formatMeetupDay('dates', '2026-10-14'), '10/14 (수)');
	assert.equal(formatMeetupDay('weekdays', '5'), '금');
	assert.equal(
		formatMeetupDays('dates', ['2026-10-14', '2026-10-15', '2026-10-16']),
		'10/14 (수) 외 2일'
	);
	assert.equal(formatMeetupDays('weekdays', ['1', '3']), '월·수');
	assert.equal(formatTimeRange(540, 1320), '09:00⁠~⁠22:00');
});

test('마지막 후보 날짜가 지난 날짜 일정만 지난 일정이다', () => {
	assert.equal(isPastMeetup('dates', ['2026-10-30', '2026-11-02'], '2026-11-03'), true);
	assert.equal(isPastMeetup('dates', ['2026-11-02', '2026-11-03'], '2026-11-03'), false);
	assert.equal(isPastMeetup('weekdays', ['1'], '2026-11-03'), false);
});
