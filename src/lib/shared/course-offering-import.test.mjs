import assert from 'node:assert/strict';
import test from 'node:test';

import { compareOfferingImport, parseCourseOfferingWorkbook } from './course-offering-import.ts';

function row(values) {
	const result = Array(34).fill(null);
	for (const [index, value] of Object.entries(values)) result[Number(index)] = value;
	return result;
}

test('KENTECH course workbook rows are normalized for offering import', () => {
	const result = parseCourseOfferingWorkbook(
		[
			row({
				2: '교과목코드',
				3: '교과목명(영문)',
				4: '교과목명(국문)',
				5: '부제목',
				6: '분반',
				7: '영역\n구분',
				8: '대표교수명',
				9: '수강\n제한\n인원',
				14: '개설\n구분',
				18: '폐강일자',
				19: '강의실',
				20: '시간표',
				21: '학점'
			}),
			row({ 0: '학부', 1: '수강학년' }),
			row({
				2: 'EF1001',
				3: 'Calculus',
				4: '공학 미적분학 I',
				6: '1',
				7: 'EF',
				8: '김현주',
				9: 38,
				14: '개설',
				19: '행정강의동(A Zone)_A-205 / 행정강의동(A Zone)_A-205',
				20: '월요일 08:30~10:30 / 목요일 08:30~10:30',
				21: 4
			}),
			row({
				2: 'ES1001',
				4: 'ESP 입문 I',
				5: 'Foundation',
				6: '02',
				7: 'ESP',
				8: '대표교수, 공동교수',
				14: '개설',
				20: '화요일 16:00~17:30',
				21: 'P'
			}),
			row({ 2: 'RC1001', 4: '폐강 과목', 6: '01', 7: 'RC', 14: '폐강', 21: 1 })
		],
		2022,
		1
	);

	assert.equal(result.academicCareer, 'undergraduate');
	assert.equal(result.offerings.length, 2);
	assert.equal(result.skippedClosedCount, 1);
	assert.equal(result.passCreditCount, 1);
	assert.equal(result.multipleProfessorCount, 1);
	assert.deepEqual(result.offerings[0].meetings, [
		{ weekday: 1, startsAt: 510, endsAt: 630, room: '행정강의동(A Zone)_A-205' },
		{ weekday: 4, startsAt: 510, endsAt: 630, room: '행정강의동(A Zone)_A-205' }
	]);
	assert.equal(result.offerings[0].subcategory, 'math');
	assert.equal(result.offerings[0].academicCareer, 'undergraduate');
	assert.equal(result.offerings[0].section, '01');
	assert.deepEqual(result.offerings[1].professorNames, ['대표교수', '공동교수']);
	assert.equal(result.offerings[1].creditType, 'pass');
	assert.equal(result.offerings[1].credits, 0);
	assert.equal(result.offerings[1].subtitle, 'Foundation');
});

test('강의실 표기를 엑셀 원본 그대로 보존한다', () => {
	const result = parseCourseOfferingWorkbook(
		[
			row({
				2: '교과목코드',
				3: '교과목명(영문)',
				4: '교과목명(국문)',
				5: '부제목',
				6: '분반',
				7: '영역구분',
				8: '대표교수명',
				9: '수강제한인원',
				14: '개설구분',
				18: '폐강일자',
				19: '강의실',
				20: '시간표',
				21: '학점'
			}),
			row({
				2: 'EL1001',
				4: '강의실 표기 시험',
				6: '01',
				7: 'EL',
				19: '행정강의동(B,C Zone)_C-304 / RC교육생활관_124',
				20: '월요일 09:00~11:00 / 목요일 09:00~11:00',
				21: 4
			})
		],
		2026,
		2
	);
	assert.deepEqual(
		result.offerings[0].meetings.map(({ room }) => room),
		['행정강의동(B,C Zone)_C-304', 'RC교육생활관_124']
	);
});

test('graduate workbook rows are detected and normalized into the common offering shape', () => {
	const result = parseCourseOfferingWorkbook(
		[
			row({
				0: 'No',
				1: '교과목코드',
				2: '교과목명',
				3: '부제목',
				4: '분반',
				5: '영역\n구분',
				6: '교수명',
				7: '수강\n제한\n인원',
				9: '개설\n구분',
				13: '폐강일자',
				14: '강의실',
				15: '시간표',
				16: '학점'
			}),
			row({ 11: '대학원', 12: '학부' }),
			row({
				0: 1,
				1: 'EE5304',
				2: 'Ceramic Engineering',
				4: '001',
				5: 'EE',
				6: '배기호',
				7: 0,
				9: '개설',
				15: '월 13:30~15:00 / 목 13:30~15:00',
				16: 3
			}),
			row({
				0: 2,
				1: 'EE6210',
				2: 'Closed Course',
				4: '001',
				5: 'EE',
				9: '폐지',
				16: 3
			})
		],
		2024,
		2
	);

	assert.equal(result.academicCareer, 'graduate');
	assert.equal(result.offerings.length, 1);
	assert.equal(result.skippedClosedCount, 1);
	assert.deepEqual(result.offerings[0], {
		courseId: 'EE5304',
		courseName: 'Ceramic Engineering',
		subtitle: null,
		category: 'EE',
		subcategory: null,
		level: 5,
		gradExcluded: false,
		professorNames: ['배기호'],
		year: 2024,
		term: 2,
		academicCareer: 'graduate',
		section: '001',
		credits: 3,
		creditType: 'numeric',
		capacity: 0,
		meetings: [
			{ weekday: 1, startsAt: 810, endsAt: 900, room: null },
			{ weekday: 4, startsAt: 810, endsAt: 900, room: null }
		]
	});
});

function offering(overrides = {}) {
	return {
		id: 'offering-1',
		courseId: 'EF1001',
		courseName: '공학 미적분학 I',
		subtitle: null,
		category: 'EF',
		subcategory: 'math',
		level: 1,
		gradExcluded: false,
		professors: [{ id: 'professor-1', name: '김교수' }],
		year: 2026,
		term: 2,
		academicCareer: 'undergraduate',
		section: '01',
		credits: 4,
		creditType: 'numeric',
		capacity: 30,
		archivedAt: null,
		meetings: [
			{
				id: 'meeting-1',
				offeringId: 'offering-1',
				weekday: 1,
				startsAt: 540,
				endsAt: 660,
				room: 'A-205'
			}
		],
		...overrides
	};
}

function incoming(overrides = {}) {
	return {
		courseId: 'EF1001',
		courseName: '공학 미적분학 I',
		subtitle: null,
		category: 'EF',
		subcategory: 'math',
		level: 1,
		gradExcluded: false,
		professorNames: ['김교수'],
		year: 2026,
		term: 2,
		academicCareer: 'undergraduate',
		section: '01',
		credits: 4,
		creditType: 'numeric',
		capacity: 30,
		meetings: [{ weekday: 1, startsAt: 540, endsAt: 660, room: 'A-205' }],
		...overrides
	};
}

test('offering comparison is idempotent and ignores professor order', () => {
	const current = offering({
		professors: [
			{ id: '1', name: '김교수' },
			{ id: '2', name: '이교수' }
		]
	});
	const next = incoming({ professorNames: ['이교수', '김교수', '김교수'] });
	assert.deepEqual(compareOfferingImport(current, next), {
		reason: null,
		professorsChanged: false
	});
});

test('offering comparison separates schedule and detail changes', () => {
	assert.deepEqual(
		compareOfferingImport(
			offering(),
			incoming({
				professorNames: ['이교수'],
				meetings: [{ weekday: 2, startsAt: 840, endsAt: 960, room: 'A-205' }]
			})
		),
		{ reason: 'schedule_changed', professorsChanged: true }
	);
	assert.deepEqual(compareOfferingImport(offering(), incoming({ professorNames: ['이교수'] })), {
		reason: 'details_changed',
		professorsChanged: true
	});
	assert.equal(
		compareOfferingImport(
			offering(),
			incoming({ meetings: [{ weekday: 1, startsAt: 540, endsAt: 660, room: 'C-303' }] })
		).reason,
		'details_changed'
	);
	assert.equal(
		compareOfferingImport(offering({ archivedAt: '2026-08-30T00:00:00.000Z' }), incoming()).reason,
		'schedule_changed'
	);
});
