import assert from 'node:assert/strict';
import test from 'node:test';

import { COURSE_SLOTS, matchesCourseSearchFilter } from './course-search.ts';

const MON = 1;
const TUE = 2;

const BLOCK_9_11 = 0;
const BLOCK_11_12 = 1;
const BLOCK_12_14 = 2;
const BLOCK_14_16 = 3;
const BLOCK_16_18 = 4;

/** 요일과 블럭 인덱스로 slot 필터를 만든다. */
function slot(weekday, index) {
	return { kind: 'slot', weekday, ...COURSE_SLOTS[index] };
}

function meeting(weekday, startsAt, endsAt) {
	return { weekday, startsAt, endsAt };
}

test('학부 강의는 블럭과 정확히 맞아 그 블럭에서 검색된다', () => {
	const meetings = [meeting(MON, 9 * 60, 11 * 60)];
	assert.equal(matchesCourseSearchFilter(meetings, slot(MON, BLOCK_9_11)), true);
	assert.equal(matchesCourseSearchFilter(meetings, slot(MON, BLOCK_11_12)), false);
});

test('두 블럭에 걸친 대학원 강의는 양쪽 블럭에서 모두 검색된다', () => {
	const meetings = [meeting(MON, 13 * 60 + 30, 15 * 60)];
	assert.equal(matchesCourseSearchFilter(meetings, slot(MON, BLOCK_12_14)), true);
	assert.equal(matchesCourseSearchFilter(meetings, slot(MON, BLOCK_14_16)), true);
	assert.equal(matchesCourseSearchFilter(meetings, slot(MON, BLOCK_16_18)), false);
});

test('경계가 맞닿기만 하면 겹치지 않는다', () => {
	const meetings = [meeting(MON, 18 * 60, 20 * 60)];
	assert.equal(matchesCourseSearchFilter(meetings, slot(MON, BLOCK_16_18)), false);
});

test('10:30~12:00 강의는 점심 블럭에서도 검색된다', () => {
	const meetings = [meeting(MON, 10 * 60 + 30, 12 * 60)];
	assert.equal(matchesCourseSearchFilter(meetings, slot(MON, BLOCK_9_11)), true);
	assert.equal(matchesCourseSearchFilter(meetings, slot(MON, BLOCK_11_12)), true);
});

test('요일이 다르면 검색되지 않는다', () => {
	const meetings = [meeting(MON, 9 * 60, 11 * 60)];
	assert.equal(matchesCourseSearchFilter(meetings, slot(TUE, BLOCK_9_11)), false);
});

test('여러 미팅 중 하나만 겹쳐도 검색된다', () => {
	const meetings = [meeting(MON, 9 * 60, 10 * 60 + 30), meeting(TUE, 15 * 60, 16 * 60 + 30)];
	assert.equal(matchesCourseSearchFilter(meetings, slot(TUE, BLOCK_14_16)), true);
});

test('전체 검색은 시간과 무관하게 모두 통과한다', () => {
	assert.equal(matchesCourseSearchFilter([], { kind: 'all' }), true);
	assert.equal(matchesCourseSearchFilter([meeting(MON, 9 * 60, 11 * 60)], { kind: 'all' }), true);
});

test('시간 미정 검색은 평일 미팅이 없는 강의만 통과한다', () => {
	assert.equal(matchesCourseSearchFilter([], { kind: 'unscheduled' }), true);
	assert.equal(
		matchesCourseSearchFilter([meeting(MON, 9 * 60, 11 * 60)], { kind: 'unscheduled' }),
		false
	);
});
