import type { CourseId } from './course.type.js';
import type { Professor } from './professor.type.js';
import type { UserId } from './user.type.js';

export type OfferingId = string;
export type TimetableId = string;
export type CompletionStatus = 'passed' | 'failed' | 'withdrawn';
export type OfferingCreditType = 'numeric' | 'pass';

export interface Meeting {
	id: string;
	offeringId: OfferingId;
	weekday: number;
	startsAt: number;
	endsAt: number;
	room: string | null;
}

export interface Offering {
	id: OfferingId;
	courseId: CourseId;
	courseName: string;
	subtitle: string | null;
	category: string | null;
	subcategory: string | null;
	level: number | null;
	gradExcluded: boolean;
	professors: Professor[];
	year: number;
	term: number;
	section: string;
	credits: number;
	creditType: OfferingCreditType;
	capacity: number | null;
	meetings: Meeting[];
}

export interface OfferingImportInput {
	courseId: string;
	courseName: string;
	subtitle: string | null;
	category: string | null;
	subcategory: string | null;
	level: number | null;
	gradExcluded: boolean;
	professorNames: string[];
	year: number;
	term: number;
	section: string;
	credits: number;
	creditType: OfferingCreditType;
	capacity: number | null;
	meetings: Array<{ weekday: number; startsAt: number; endsAt: number; room: string | null }>;
}

export interface OfferingWorkbookParseResult {
	offerings: OfferingImportInput[];
	skippedClosedCount: number;
	passCreditCount: number;
	multipleProfessorCount: number;
}

export interface CourseCompletion {
	id: string;
	userId: UserId;
	courseId: CourseId | null;
	offeringId: OfferingId | null;
	externalCourseId: string | null;
	year: number;
	term: number;
	credits: number;
	grade: string | null;
	status: CompletionStatus;
	source: 'manual' | 'portal' | 'admin';
}

export interface ExternalCourse {
	id: string;
	institution: string;
	courseCode: string;
	name: string;
}

export interface CourseCompletionView extends CourseCompletion {
	courseCode: string;
	courseName: string;
	institution: string | null;
	isExternal: boolean;
	isCreditRecognition: boolean;
	offering: Offering | null;
}

export interface StudentAcademicProfile {
	userId: UserId;
	admissionYear: number;
	espWaivedCourseIds: string[];
}
