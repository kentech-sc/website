import assert from 'node:assert/strict';
import test from 'node:test';

import { parseCourseOfferingWorkbook } from './course-offering-import.ts';

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
				19: 'A-205 / A-205',
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
		{ weekday: 1, startsAt: 510, endsAt: 630, room: 'A-205' },
		{ weekday: 4, startsAt: 510, endsAt: 630, room: 'A-205' }
	]);
	assert.equal(result.offerings[0].subcategory, 'math');
	assert.equal(result.offerings[0].academicCareer, 'undergraduate');
	assert.equal(result.offerings[0].section, '01');
	assert.deepEqual(result.offerings[1].professorNames, ['대표교수', '공동교수']);
	assert.equal(result.offerings[1].creditType, 'pass');
	assert.equal(result.offerings[1].credits, 0);
	assert.equal(result.offerings[1].subtitle, 'Foundation');
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
