import ExcelJS from '@excel.js/exceljs';
import 'fast-csv';

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
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.load(Buffer.from(await file.arrayBuffer()));
	const worksheet = workbook.worksheets[0];
	if (!worksheet) throw new Error('엑셀 파일에 시트가 없습니다.');
	const rows: Array<Array<string | null>> = [];
	worksheet.eachRow({ includeEmpty: true }, (row) => {
		rows.push(Array.from({ length: 34 }, (_, index) => row.getCell(index + 1).text || null));
	});
	return parseCourseOfferingWorkbook(rows, year, term);
}
