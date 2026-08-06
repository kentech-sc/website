import { readSheet } from 'read-excel-file/node';

import type { OfferingWorkbookParseResult } from '$lib/types/academic.type.js';

import { parseCourseOfferingWorkbook } from '$lib/shared/course-offering-import.js';

const MAX_WORKBOOK_SIZE = 4 * 1024 * 1024;

export async function readCourseOfferingWorkbook(
	file: File,
	year: number,
	term: number
): Promise<OfferingWorkbookParseResult> {
	if (!file.name.toLowerCase().endsWith('.xlsx'))
		throw new Error('.xlsx 파일만 업로드할 수 있습니다.');
	if (file.size === 0) throw new Error('빈 엑셀 파일은 업로드할 수 없습니다.');
	if (file.size > MAX_WORKBOOK_SIZE) throw new Error('엑셀 파일은 4MB 이하여야 합니다.');
	const sheet = await readSheet(Buffer.from(await file.arrayBuffer()));
	if (!sheet.length) throw new Error('엑셀 파일에 데이터가 없습니다.');
	const rows = sheet.map((row) => row.map((cell) => (cell === null ? null : String(cell))));
	return parseCourseOfferingWorkbook(rows, year, term);
}
