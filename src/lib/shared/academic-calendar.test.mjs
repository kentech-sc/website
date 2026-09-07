import assert from 'node:assert/strict';
import test from 'node:test';

import {
	dedupeEntries,
	entriesInRange,
	entriesOn,
	isSpan,
	parseSchedule,
	sortEntries
} from './academic-calendar.ts';
import {
	addDays,
	getKstDayKey,
	getMonthDayKeys,
	getTwoWeekDayKeys,
	getWeekdayIndex,
	toCompactDayKey,
	toMonthKey
} from './day-key.ts';

test('포털 응답을 일정 목록으로 정규화한다', () => {
	const entries = parseSchedule({
		calendarDate: '2026-09',
		calendarList: [
			{ start_day: '2026-09-07', end_day: '2026-09-11', subject: '졸업 신청' },
			{ start_day: '2026-09-25', end_day: '2026-09-25', subject: '수업일수 1/4선' }
		]
	});

	assert.deepEqual(entries, [
		{ startDay: '2026-09-07', endDay: '2026-09-11', subject: '졸업 신청' },
		{ startDay: '2026-09-25', endDay: '2026-09-25', subject: '수업일수 1/4선' }
	]);
});

test('일정이 없는 달과 형식이 깨진 항목을 걸러낸다', () => {
	assert.deepEqual(parseSchedule({ calendarList: [] }), []);
	assert.deepEqual(parseSchedule({}), []);
	assert.deepEqual(parseSchedule({ calendarList: [{ subject: '제목만 있음' }] }), []);
});

test('여러 달을 합칠 때 같은 기간 일정이 중복되지 않는다', () => {
	// 기간 일정은 걸치는 달마다 응답에 실려 온다.
	const august = parseSchedule({
		calendarList: [{ start_day: '2026-06-20', end_day: '2026-08-30', subject: '하계방학' }]
	});
	const july = parseSchedule({
		calendarList: [{ start_day: '2026-06-20', end_day: '2026-08-30', subject: '하계방학' }]
	});

	assert.equal(dedupeEntries([...august, ...july]).length, 1);
});

test('하루짜리와 기간짜리를 구분한다', () => {
	assert.equal(isSpan({ startDay: '2026-09-07', endDay: '2026-09-11', subject: 'x' }), true);
	assert.equal(isSpan({ startDay: '2026-09-07', endDay: '2026-09-07', subject: 'x' }), false);
});

test('기간 일정은 시작과 종료 사이 모든 날에 걸린다', () => {
	const entries = [{ startDay: '2026-09-07', endDay: '2026-09-11', subject: '졸업 신청' }];

	assert.equal(entriesOn(entries, '2026-09-06').length, 0);
	assert.equal(entriesOn(entries, '2026-09-07').length, 1);
	assert.equal(entriesOn(entries, '2026-09-09').length, 1);
	assert.equal(entriesOn(entries, '2026-09-11').length, 1);
	assert.equal(entriesOn(entries, '2026-09-12').length, 0);
});

test('구간과 겹치는 일정만 고른다', () => {
	const entries = [
		{ startDay: '2026-06-20', endDay: '2026-08-30', subject: '하계방학' },
		{ startDay: '2026-10-05', endDay: '2026-10-05', subject: '대체공휴일' }
	];

	assert.equal(entriesInRange(entries, '2026-09-01', '2026-09-30').length, 0);
	assert.equal(entriesInRange(entries, '2026-08-01', '2026-08-31').length, 1);
});

test('시작일 순으로 정렬한다', () => {
	const sorted = sortEntries([
		{ startDay: '2026-09-25', endDay: '2026-09-25', subject: '나중' },
		{ startDay: '2026-09-07', endDay: '2026-09-11', subject: '먼저' }
	]);

	assert.equal(sorted[0].subject, '먼저');
});

test('2주 창은 그 주 월요일에서 시작해 14일이다', () => {
	// 2026-09-07 은 월요일
	const fromMonday = getTwoWeekDayKeys('2026-09-07');
	assert.equal(fromMonday.length, 14);
	assert.equal(fromMonday[0], '2026-09-07');
	assert.equal(fromMonday[13], '2026-09-20');

	// 일요일에는 그 주 월요일까지 거슬러 올라간다
	assert.equal(getTwoWeekDayKeys('2026-09-13')[0], '2026-09-07');
});

test('달 경계를 넘는 2주 창은 두 달에 걸친다', () => {
	const days = getTwoWeekDayKeys('2026-09-28');
	const months = [...new Set(days.map(toMonthKey))];

	assert.deepEqual(months, ['2026-09', '2026-10']);
});

test('월 목록은 1일부터 말일까지다', () => {
	assert.equal(getMonthDayKeys('2026-09-07').length, 30);
	assert.equal(getMonthDayKeys('2026-02-10').length, 28);
	assert.equal(getMonthDayKeys('2026-12-31').at(-1), '2026-12-31');
});

test('날짜 계산은 실행 타임존에 영향받지 않는다', () => {
	// getDate()/getDay() 를 쓰면 서버(UTC)와 브라우저(KST)가 다른 날짜를 그린다.
	assert.equal(addDays('2026-09-07', 1), '2026-09-08');
	assert.equal(addDays('2026-09-01', -1), '2026-08-31');
	assert.equal(getWeekdayIndex('2026-09-07'), 1);
	assert.equal(getWeekdayIndex('2026-09-13'), 0);
});

test('KST 기준 날짜를 뽑는다', () => {
	// UTC 로는 9/6 16:30 이지만 한국은 이미 9/7 01:30 이다.
	assert.equal(getKstDayKey(new Date('2026-09-06T16:30:00.000Z')), '2026-09-07');
	assert.equal(getKstDayKey(new Date('2026-09-06T14:59:00.000Z')), '2026-09-06');
});

test('학식 API 용 압축 형식으로 바꾼다', () => {
	assert.equal(toCompactDayKey('2026-09-07'), '20260907');
});
