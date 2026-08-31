import type {
	AcademicCareer,
	Offering,
	OfferingImportInput,
	OfferingWorkbookParseResult
} from '$lib/types/academic.type.js';
import type { TimetableItemChangeReason } from '$lib/types/timetable.type.js';

type CellValue = string | number | boolean | Date | null;
type SheetData = CellValue[][];

interface WorkbookFormat {
	academicCareer: AcademicCareer;
	courseNameHeaders: string[];
	professorHeader: string;
}

interface ResolvedColumns {
	code: number;
	courseNames: number[];
	subtitle: number;
	section: number;
	category: number;
	professor: number;
	capacity: number;
	openingStatus: number;
	closedAt: number;
	room: number;
	time: number;
	credits: number;
}

const WORKBOOK_FORMATS: WorkbookFormat[] = [
	{
		academicCareer: 'undergraduate',
		courseNameHeaders: ['교과목명(국문)', '교과목명(영문)'],
		professorHeader: '대표교수명'
	},
	{
		academicCareer: 'graduate',
		courseNameHeaders: ['교과목명'],
		professorHeader: '교수명'
	}
];

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

export interface OfferingImportChange {
	reason: TimetableItemChangeReason | null;
	professorsChanged: boolean;
}

function normalizedText(value: string | null | undefined): string {
	return value?.trim().replace(/\s+/g, ' ') ?? '';
}

function sortedSignature(values: string[]): string {
	return [...new Set(values.map(normalizedText).filter(Boolean))].sort().join('\u0000');
}

function meetingTimeSignature(
	meetings: Array<{ weekday: number; startsAt: number; endsAt: number }>
): string {
	return meetings
		.map(({ weekday, startsAt, endsAt }) => `${weekday}:${startsAt}:${endsAt}`)
		.sort()
		.join('|');
}

function meetingRoomSignature(
	meetings: Array<{ weekday: number; startsAt: number; endsAt: number; room: string | null }>
): string {
	return meetings
		.map(
			({ weekday, startsAt, endsAt, room }) =>
				`${weekday}:${startsAt}:${endsAt}:${normalizedText(room)}`
		)
		.sort()
		.join('|');
}

/** 같은 개설 강좌의 현재 DB 값과 새 엑셀 값을 비교한다. */
export function compareOfferingImport(
	existing: Offering,
	incoming: OfferingImportInput
): OfferingImportChange {
	const existingProfessorNames = existing.professors.map(({ name }) => name);
	const professorsChanged =
		sortedSignature(existingProfessorNames) !== sortedSignature(incoming.professorNames);
	if (existing.archivedAt !== null) return { reason: 'schedule_changed', professorsChanged };
	if (meetingTimeSignature(existing.meetings) !== meetingTimeSignature(incoming.meetings))
		return { reason: 'schedule_changed', professorsChanged };

	const detailsChanged =
		meetingRoomSignature(existing.meetings) !== meetingRoomSignature(incoming.meetings) ||
		professorsChanged ||
		normalizedText(existing.courseName) !== normalizedText(incoming.courseName) ||
		normalizedText(existing.subtitle) !== normalizedText(incoming.subtitle) ||
		normalizedText(existing.category) !== normalizedText(incoming.category) ||
		normalizedText(existing.subcategory) !== normalizedText(incoming.subcategory) ||
		existing.level !== incoming.level ||
		existing.gradExcluded !== incoming.gradExcluded;
	return { reason: detailsChanged ? 'details_changed' : null, professorsChanged };
}

function text(value: CellValue | undefined): string {
	return value === null || value === undefined ? '' : String(value).trim();
}

function normalizedHeader(value: CellValue | undefined): string {
	return text(value).replace(/\s+/g, '');
}

function headerIndex(row: SheetData[number], name: string): number {
	const normalized = normalizedHeader(name);
	return row.findIndex((value) => normalizedHeader(value) === normalized);
}

function requiredHeaderIndex(row: SheetData[number], name: string): number {
	const index = headerIndex(row, name);
	if (index < 0) throw new Error(`${name} 열을 찾을 수 없습니다.`);
	return index;
}

function resolveFormat(rows: SheetData): {
	headerRowIndex: number;
	format: WorkbookFormat;
	columns: ResolvedColumns;
} {
	for (let headerRowIndex = 0; headerRowIndex < rows.length; headerRowIndex += 1) {
		const row = rows[headerRowIndex];
		if (headerIndex(row, '교과목코드') < 0) continue;
		const format = WORKBOOK_FORMATS.find((candidate) =>
			candidate.courseNameHeaders.some((name) => headerIndex(row, name) >= 0)
		);
		if (!format) continue;
		return {
			headerRowIndex,
			format,
			columns: {
				code: requiredHeaderIndex(row, '교과목코드'),
				courseNames: format.courseNameHeaders.map((name) => requiredHeaderIndex(row, name)),
				subtitle: requiredHeaderIndex(row, '부제목'),
				section: requiredHeaderIndex(row, '분반'),
				category: requiredHeaderIndex(row, '영역구분'),
				professor: requiredHeaderIndex(row, format.professorHeader),
				capacity: requiredHeaderIndex(row, '수강제한인원'),
				openingStatus: requiredHeaderIndex(row, '개설구분'),
				closedAt: requiredHeaderIndex(row, '폐강일자'),
				room: requiredHeaderIndex(row, '강의실'),
				time: requiredHeaderIndex(row, '시간표'),
				credits: requiredHeaderIndex(row, '학점')
			}
		};
	}
	throw new Error('지원하는 학부 또는 대학원 개설교과목 형식을 찾을 수 없습니다.');
}

function numberOrNull(value: CellValue | undefined): number | null {
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
	const { headerRowIndex, format, columns } = resolveFormat(rows);
	const offerings: OfferingImportInput[] = [];
	let skippedClosedCount = 0;
	let passCreditCount = 0;
	let multipleProfessorCount = 0;

	for (let index = headerRowIndex + 1; index < rows.length; index += 1) {
		const row = rows[index];
		const courseId = text(row[columns.code]);
		if (!courseId || courseId === '교과목코드') continue;
		if (/^(폐강|폐지)$/.test(text(row[columns.openingStatus])) || text(row[columns.closedAt])) {
			skippedClosedCount += 1;
			continue;
		}

		const courseName = columns.courseNames.map((column) => text(row[column])).find(Boolean) ?? '';
		const category = text(row[columns.category]) || null;
		const metadata = inferMetadata(courseId, category);
		const professorNames = [
			...new Set(
				text(row[columns.professor])
					.split(',')
					.map((name) => name.trim())
					.filter(Boolean)
			)
		];
		if (professorNames.length > 1) multipleProfessorCount += 1;

		const creditValue = text(row[columns.credits]).toUpperCase();
		const isPassCredit = creditValue === 'P';
		const credits = isPassCredit ? 0 : Number(creditValue);
		if (isPassCredit) passCreditCount += 1;
		const meetings = parseMeetings(text(row[columns.time]), text(row[columns.room]), index + 1);

		const offering: OfferingImportInput = {
			courseId,
			courseName,
			subtitle: text(row[columns.subtitle]) || null,
			...metadata,
			professorNames,
			year,
			term,
			academicCareer: format.academicCareer,
			section: (text(row[columns.section]) || '01').padStart(2, '0'),
			credits,
			creditType: isPassCredit ? 'pass' : 'numeric',
			capacity: numberOrNull(row[columns.capacity]),
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
	return {
		academicCareer: format.academicCareer,
		offerings,
		skippedClosedCount,
		passCreditCount,
		multipleProfessorCount
	};
}
