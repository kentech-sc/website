import assert from 'node:assert/strict';
import test from 'node:test';

import { isApCreditCode } from './academic-credit.js';
import { isSameCourseName, parsePortalCompletionText } from './portal-completion-import.ts';

test('parses portal rows and preserves failed and withdrawn grades', () => {
	const result = parsePortalCompletionText(
		[
			'EF\tEF1001\t미적분학\t4\tA+\t2022-spring',
			'EL\tEL2001\t에너지공학\t3\tF\t2023-2학기',
			'HASS\tHA1001\t인문학\t2\tW\t2024 하계학기'
		].join('\n')
	);
	assert.deepEqual(
		result.rows.map(({ courseId, year, term, status }) => ({ courseId, year, term, status })),
		[
			{ courseId: 'EF1001', year: 2022, term: 1, status: 'passed' },
			{ courseId: 'EL2001', year: 2023, term: 2, status: 'failed' },
			{ courseId: 'HA1001', year: 2024, term: 3, status: 'withdrawn' }
		]
	);
});

test('accepts course codes that start with a digit', () => {
	const result = parsePortalCompletionText(
		'FR\t0012345\t타 학교 계절학기 과목\t3\tA0\t2024 하계학기'
	);
	assert.equal(result.skippedCount, 0);
	assert.deepEqual(
		result.rows.map(({ courseId, year, term }) => ({ courseId, year, term })),
		[{ courseId: '0012345', year: 2024, term: 3 }]
	);
});

test('compares course names ignoring whitespace and prefix/suffix noise', () => {
	assert.equal(isSameCourseName('일반물리학1', '일반물리학 1'), true);
	assert.equal(isSameCourseName('양자화학 및 분광학', '1양자화학 및 분광학'), true);
	assert.equal(isSameCourseName('일반물리학1', '일반화학1'), false);
});

test('keeps the KIS category column so uncataloged courses land in the right area', () => {
	const result = parsePortalCompletionText(
		[
			'RC\tRC1001\tRC 신입생 세미나 1\t1.00\tS\t2022-spring',
			'FR\tM3502.002200\t(공유)디지털논리회로\t1.00\tS\t2026-spring'
		].join('\n')
	);
	assert.deepEqual(
		result.rows.map(({ courseId, category }) => ({ courseId, category })),
		[
			{ courseId: 'RC1001', category: 'RC' },
			{ courseId: 'M3502.002200', category: 'FR' }
		]
	);
});

test('skips unfinished and malformed rows and deduplicates the same course period', () => {
	const result = parsePortalCompletionText(
		[
			'영역\t교과목코드\t교과목명\t학점\t성적\t학기',
			'ESP\tESP1001\tESP 입문\t0\tP\t2025-winter',
			'ESP\tESP1001\tESP 입문\t0\tP\t2025-winter',
			'EL\tEL2002\t수강 중\t3\t\t2026-spring'
		].join('\n')
	);
	assert.equal(result.rows.length, 1);
	assert.equal(result.rows[0].term, 4);
	assert.equal(result.skippedCount, 2);
});

test('recognizes KIS AP credit codes without treating ordinary courses as AP credits', () => {
	assert.equal(isApCreditCode('F000017'), true);
	assert.equal(isApCreditCode('EF1001'), false);
	assert.equal(isApCreditCode('F00001'), false);
});
