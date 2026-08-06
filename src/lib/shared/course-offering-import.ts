import type { OfferingImportInput, OfferingWorkbookParseResult } from '$lib/types/academic.type.js';
type CellValue = string | number | boolean | Date | null;
type SheetData = CellValue[][];

const COLUMN = {
	code: 2,
	englishName: 3,
	koreanName: 4,
	subtitle: 5,
	section: 6,
	category: 7,
	professor: 8,
	capacity: 9,
	openingStatus: 14,
	closedAt: 18,
	room: 19,
	time: 20,
	credits: 21
} as const;

const WEEKDAY: Record<string, number> = {
	월: 1,
	월요일: 1,
	화: 2,
	화요일: 2,
	수: 3,
	수요일: 3,
	목: 4,
	목요일: 4,
	금: 5,
	금요일: 5,
	토: 6,
	토요일: 6,
	일: 7,
	일요일: 7
};

const EF_SUBCATEGORY: Record<string, string> = Object.fromEntries([
	...[
		'EF1001',
		'EF1008',
		'EF1009',
		'EF1011',
		'EF1012',
		'EF1013',
		'EF1014',
		'EF1015',
		'EF1016',
		'EF1017',
		'EF2007',
		'EF2008',
		'EF2031',
		'EF2032',
		'EF2033'
	].map((id) => [id, 'math']),
	...['EF1004', 'EF1005', 'EF1051', 'EF2004', 'EF2036'].map((id) => [id, 'physics']),
	...['EF1002', 'EF1006', 'EF1007', 'EF2002', 'EF2005', 'EF2034'].map((id) => [id, 'chemistry']),
	...['EF1003', 'EF2003', 'EF2006', 'EF2035', 'EF2039'].map((id) => [id, 'data_literacy'])
]);

function text(value: SheetData[number][number]): string {
	return value === null ? '' : String(value).trim();
}

function numberOrNull(value: SheetData[number][number]): number | null {
	const raw = text(value);
	if (!raw) return null;
	const parsed = Number(raw);
	return Number.isFinite(parsed) ? parsed : null;
}

function minutes(value: string): number {
	const [hour, minute] = value.split(':').map(Number);
	return hour * 60 + minute;
}

function inferLevel(courseId: string): number | null {
	const match = courseId.match(/^[A-Z]+(\d)/);
	return match ? Number(match[1]) : null;
}

function inferMetadata(courseId: string, category: string | null) {
	return {
		category,
		subcategory: EF_SUBCATEGORY[courseId] ?? null,
		level: inferLevel(courseId),
		gradExcluded: courseId.startsWith('GR') || ['RC1011', 'RC1012', 'RC1013'].includes(courseId)
	};
}

function parseMeetings(timeValue: string, roomValue: string, rowNumber: number) {
	if (!timeValue) return [];
	const times = timeValue.split(/\s*\/\s*/).filter(Boolean);
	const rooms = roomValue.split(/\s*\/\s*/).filter(Boolean);
	return times.map((part, index) => {
		const match = part.match(
			/^(월요일|화요일|수요일|목요일|금요일|토요일|일요일|월|화|수|목|금|토|일)\s*(\d{1,2}:\d{2})\s*[~～\-–]\s*(\d{1,2}:\d{2})$/
		);
		if (!match) throw new Error(`${rowNumber}행 시간표 형식을 읽을 수 없습니다: ${part}`);
		return {
			weekday: WEEKDAY[match[1]],
			startsAt: minutes(match[2]),
			endsAt: minutes(match[3]),
			room: rooms[index] ?? rooms.at(-1) ?? null
		};
	});
}

export function parseCourseOfferingWorkbook(
	rows: SheetData,
	year: number,
	term: number
): OfferingWorkbookParseResult {
	const headerIndex = rows.findIndex(
		(row) =>
			text(row[COLUMN.code]) === '교과목코드' && text(row[COLUMN.koreanName]) === '교과목명(국문)'
	);
	if (headerIndex < 0) throw new Error('교과목코드와 교과목명(국문) 열을 찾을 수 없습니다.');

	const offerings: OfferingImportInput[] = [];
	let skippedClosedCount = 0;
	let passCreditCount = 0;
	let multipleProfessorCount = 0;

	for (let index = headerIndex + 1; index < rows.length; index += 1) {
		const row = rows[index];
		const courseId = text(row[COLUMN.code]);
		if (!courseId || courseId === '교과목코드') continue;
		if (text(row[COLUMN.openingStatus]) === '폐강' || text(row[COLUMN.closedAt])) {
			skippedClosedCount += 1;
			continue;
		}

		const courseName = text(row[COLUMN.koreanName]) || text(row[COLUMN.englishName]);
		const category = text(row[COLUMN.category]) || null;
		const metadata = inferMetadata(courseId, category);
		const professorNames = [
			...new Set(
				text(row[COLUMN.professor])
					.split(',')
					.map((name) => name.trim())
					.filter(Boolean)
			)
		];
		if (professorNames.length > 1) multipleProfessorCount += 1;

		const creditValue = text(row[COLUMN.credits]).toUpperCase();
		const isPassCredit = creditValue === 'P';
		const credits = isPassCredit ? 0 : Number(creditValue);
		if (isPassCredit) passCreditCount += 1;
		const meetings = parseMeetings(text(row[COLUMN.time]), text(row[COLUMN.room]), index + 1);

		const offering: OfferingImportInput = {
			courseId,
			courseName,
			subtitle: text(row[COLUMN.subtitle]) || null,
			...metadata,
			professorNames,
			year,
			term,
			section: (text(row[COLUMN.section]) || '01').padStart(2, '0'),
			credits,
			creditType: isPassCredit ? 'pass' : 'numeric',
			capacity: numberOrNull(row[COLUMN.capacity]),
			meetings
		};
		if (
			!offering.courseName ||
			!Number.isFinite(offering.credits) ||
			offering.credits < 0 ||
			offering.meetings.some((meeting) => meeting.startsAt >= meeting.endsAt)
		)
			throw new Error(`${index + 1}행의 필수 값을 확인해주세요.`);
		offerings.push(offering);
	}

	if (!offerings.length) throw new Error('가져올 수 있는 개설 강의가 없습니다.');
	return { offerings, skippedClosedCount, passCreditCount, multipleProfessorCount };
}
