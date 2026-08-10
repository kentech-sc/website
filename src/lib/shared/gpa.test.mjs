import assert from 'node:assert/strict';
import test from 'node:test';

import { calculateGpa, calculateTermGpas } from './gpa.ts';

test('calculates the credit-weighted GPA on the KENTECH 4.3 scale', () => {
	const result = calculateGpa([
		{ courseCode: 'EF1001', credits: 4, grade: 'A+', year: 2024, term: 1 },
		{ courseCode: 'HASS101', credits: 2, grade: 'B0', year: 2024, term: 1 },
		{ courseCode: 'ESP101', credits: 1, grade: 'S', year: 2024, term: 1 }
	]);
	assert.ok(result);
	assert.equal(result.gradedCredits, 6);
	assert.equal(result.courseCount, 2);
	assert.equal(result.value, (4.3 * 4 + 3 * 2) / 6);
});

test('includes F but excludes grades that do not affect GPA', () => {
	const result = calculateGpa([
		{ courseCode: 'EL2001', credits: 3, grade: 'F', year: 2024, term: 2 },
		{ courseCode: 'RC1001', credits: 1, grade: 'U', year: 2024, term: 2 },
		{ courseCode: 'EL2002', credits: 3, grade: null, year: 2024, term: 2 }
	]);
	assert.deepEqual(result, { value: 0, gradedCredits: 3, qualityPoints: 0, courseCount: 1 });
});

test('uses only the latest graded attempt for a repeated course', () => {
	const result = calculateGpa([
		{ courseCode: 'EF1001', credits: 4, grade: 'C+', year: 2023, term: 2 },
		{ courseCode: 'EF1001', credits: 4, grade: 'A0', year: 2024, term: 1 }
	]);
	assert.deepEqual(result, { value: 4, gradedCredits: 4, qualityPoints: 16, courseCount: 1 });
});

test('returns null when no registered grade affects GPA', () => {
	assert.equal(
		calculateGpa([
			{ courseCode: 'RC1001', credits: 1, grade: 'S', year: 2024, term: 1 },
			{ courseCode: 'RC1002', credits: 1, grade: 'W', year: 2024, term: 2 }
		]),
		null
	);
});

test('calculates semester GPA separately and orders the latest semester first', () => {
	const result = calculateTermGpas([
		{ courseCode: 'EF1001', credits: 4, grade: 'B0', year: 2023, term: 2 },
		{ courseCode: 'EF1001', credits: 4, grade: 'A+', year: 2024, term: 1 },
		{ courseCode: 'RC1001', credits: 1, grade: 'S', year: 2024, term: 1 }
	]);
	assert.deepEqual(
		result.map(({ year, term, value, gradedCredits }) => ({ year, term, value, gradedCredits })),
		[
			{ year: 2024, term: 1, value: 4.3, gradedCredits: 4 },
			{ year: 2023, term: 2, value: 3, gradedCredits: 4 }
		]
	);
});
