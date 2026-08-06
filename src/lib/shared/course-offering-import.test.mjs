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
			row({ 2: '교과목코드', 4: '교과목명(국문)' }),
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

	assert.equal(result.offerings.length, 2);
	assert.equal(result.skippedClosedCount, 1);
	assert.equal(result.passCreditCount, 1);
	assert.equal(result.multipleProfessorCount, 1);
	assert.deepEqual(result.offerings[0].meetings, [
		{ weekday: 1, startsAt: 510, endsAt: 630, room: 'A-205' },
		{ weekday: 4, startsAt: 510, endsAt: 630, room: 'A-205' }
	]);
	assert.equal(result.offerings[0].subcategory, 'math');
	assert.equal(result.offerings[0].section, '01');
	assert.deepEqual(result.offerings[1].professorNames, ['대표교수', '공동교수']);
	assert.equal(result.offerings[1].creditType, 'pass');
	assert.equal(result.offerings[1].credits, 0);
	assert.equal(result.offerings[1].subtitle, 'Foundation');
});
