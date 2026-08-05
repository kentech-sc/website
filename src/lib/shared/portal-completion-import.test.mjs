import assert from 'node:assert/strict';
import test from 'node:test';

import { isApCreditCode } from './academic-credit.js';
import { parsePortalCompletionText } from './portal-completion-import.ts';

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
