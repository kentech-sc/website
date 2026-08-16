import assert from 'node:assert/strict';
import test from 'node:test';

import { buildCourseSearchModel } from './course-search-model.ts';
import {
	COURSE_SLOTS,
	getFreeTimeRanges,
	matchesCourseSearchFilter,
	overlapsTimeRange
} from './course-search.ts';

const MON = 1;
const TUE = 2;

function block(startsAt) {
	const result = COURSE_SLOTS.find((item) => item.startsAt === startsAt);
	assert.ok(result);
	return result;
}

function slot(weekday, startsAt) {
	return { kind: 'slot', weekday, ...block(startsAt) };
}

function meeting(weekday, startsAt, endsAt) {
	return { weekday, startsAt, endsAt };
}

function offering(id, courseId, meetings, options = {}) {
	return {
		id,
		courseId,
		courseName: options.courseName ?? courseId,
		subtitle: null,
		category: options.category ?? 'EL',
		academicCareer: options.academicCareer ?? 'undergraduate',
		professors: [],
		meetings
	};
}

test('정규 시간대와 점심시간을 추가 버튼 블록으로 정의한다', () => {
	assert.deepEqual(COURSE_SLOTS, [
		{ startsAt: 9 * 60, endsAt: 11 * 60 },
		{ startsAt: 11 * 60, endsAt: 12 * 60 },
		{ startsAt: 12 * 60, endsAt: 14 * 60 },
		{ startsAt: 14 * 60, endsAt: 16 * 60 },
		{ startsAt: 16 * 60, endsAt: 18 * 60 },
		{ startsAt: 18 * 60, endsAt: 20 * 60 }
	]);
});

test('블록과 정확히 맞는 강의를 찾는다', () => {
	const meetings = [meeting(MON, 9 * 60, 11 * 60)];
	assert.equal(matchesCourseSearchFilter(meetings, slot(MON, 9 * 60)), true);
	assert.equal(matchesCourseSearchFilter(meetings, slot(MON, 11 * 60)), false);
});

test('점심시간 강의를 점심 블록에서 검색한다', () => {
	const meetings = [meeting(MON, 11 * 60, 12 * 60)];
	assert.equal(matchesCourseSearchFilter(meetings, slot(MON, 11 * 60)), true);
	assert.equal(matchesCourseSearchFilter(meetings, slot(MON, 12 * 60)), false);
});

test('불규칙한 대학원 강의는 걸쳐 있는 정규 블록에서 검색된다', () => {
	const meetings = [meeting(MON, 13 * 60 + 30, 15 * 60)];
	assert.equal(matchesCourseSearchFilter(meetings, slot(MON, 12 * 60)), true);
	assert.equal(matchesCourseSearchFilter(meetings, slot(MON, 14 * 60)), true);
	assert.equal(matchesCourseSearchFilter(meetings, slot(MON, 16 * 60)), false);
});

test('경계만 맞닿은 시간은 겹치지 않는다', () => {
	assert.equal(overlapsTimeRange(meeting(MON, 18 * 60, 20 * 60), slot(MON, 16 * 60)), false);
});

test('부분 점유 블록에서는 강의 앞뒤의 연속된 빈 구간만 반환한다', () => {
	assert.deepEqual(getFreeTimeRanges(MON, block(12 * 60), [meeting(MON, 13 * 60 + 30, 15 * 60)]), [
		{ startsAt: 12 * 60, endsAt: 13 * 60 + 30 }
	]);
	assert.deepEqual(getFreeTimeRanges(MON, block(14 * 60), [meeting(MON, 13 * 60 + 30, 15 * 60)]), [
		{ startsAt: 15 * 60, endsAt: 16 * 60 }
	]);
});

test('겹치거나 이어진 여러 강의 시간은 하나의 점유 구간처럼 처리한다', () => {
	assert.deepEqual(
		getFreeTimeRanges(MON, block(12 * 60), [
			meeting(MON, 12 * 60 + 30, 13 * 60 + 30),
			meeting(MON, 13 * 60, 14 * 60)
		]),
		[{ startsAt: 12 * 60, endsAt: 12 * 60 + 30 }]
	);
});

test('완전히 빈 블록은 기존과 동일하게 블록 전체를 반환한다', () => {
	assert.deepEqual(getFreeTimeRanges(MON, block(9 * 60), []), [block(9 * 60)]);
});

test('교체 기준은 선택한 강의의 실제 시간 전체를 사용한다', () => {
	const replacementFilter = {
		kind: 'replace',
		sourceOfferingId: 'source',
		meetingId: 'meeting',
		weekday: MON,
		startsAt: 16 * 60 + 30,
		endsAt: 18 * 60
	};
	assert.equal(
		matchesCourseSearchFilter([meeting(MON, 16 * 60, 17 * 60 + 30)], replacementFilter),
		true
	);
	assert.equal(
		matchesCourseSearchFilter([meeting(MON, 18 * 60, 20 * 60)], replacementFilter),
		false
	);
});

test('요일이 다르면 검색되지 않는다', () => {
	assert.equal(
		matchesCourseSearchFilter([meeting(MON, 9 * 60, 11 * 60)], slot(TUE, 9 * 60)),
		false
	);
});

test('전체 검색과 시간 미정 검색을 구분한다', () => {
	assert.equal(matchesCourseSearchFilter([], { kind: 'all' }), true);
	assert.equal(matchesCourseSearchFilter([], { kind: 'unscheduled' }), true);
	assert.equal(
		matchesCourseSearchFilter([meeting(MON, 9 * 60, 11 * 60)], { kind: 'unscheduled' }),
		false
	);
});

test('교체 검색 결과를 같은 과목의 다른 분반과 같은 시간대 강의로 나눈다', () => {
	const source = offering('source', 'EL101', [meeting(MON, 9 * 60, 11 * 60)]);
	const otherSection = offering('section', 'EL101', [meeting(TUE, 9 * 60, 11 * 60)]);
	const sameTime = offering('same-time', 'EF101', [meeting(MON, 9 * 60, 11 * 60)]);
	const model = buildCourseSearchModel({
		offerings: [source, otherSection, sameTime],
		selectedOfferings: [source],
		offeringRestrictions: {},
		offeringNotices: {},
		filter: {
			kind: 'replace',
			sourceOfferingId: source.id,
			meetingId: 'source-meeting',
			weekday: MON,
			startsAt: 9 * 60,
			endsAt: 11 * 60
		},
		query: '',
		category: 'all'
	});

	assert.deepEqual(
		model.sectionReplacements.map((item) => item.id),
		['section']
	);
	assert.deepEqual(
		model.timeReplacements.map((item) => item.id),
		['same-time']
	);
});

test('이미 선택한 강의와 겹치는 검색 결과의 제한 이유를 계산한다', () => {
	const selected = offering('selected', 'EL101', [meeting(MON, 9 * 60, 11 * 60)]);
	const conflict = offering('conflict', 'EF101', [meeting(MON, 10 * 60, 12 * 60)]);
	const model = buildCourseSearchModel({
		offerings: [conflict],
		selectedOfferings: [selected],
		offeringRestrictions: {},
		offeringNotices: {},
		filter: { kind: 'all' },
		query: '',
		category: 'all'
	});

	assert.equal(model.restrictionFor(conflict, false)?.label, '시간 겹침');
});
