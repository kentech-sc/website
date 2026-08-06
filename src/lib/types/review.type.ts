import type { OfferingId } from './academic.type.js';
import type { CourseId } from './course.type.js';
import type { Professor } from './professor.type.js';
import type { UserId } from './user.type.js';

export type ReviewId = string;

export interface ReviewScore {
	assignment: number;
	lecture: number;
	exam: number;
	satisfaction: number;
}

export interface ReviewCreate {
	offeringId: OfferingId;
	userId: UserId;
	title: string;
	score: ReviewScore;
	comment: string;
}

export interface ReviewEntity extends ReviewCreate {
	id: ReviewId;
	createdAt: string;
	updatedAt: string;
}

export interface Review extends ReviewEntity {
	courseId: CourseId;
	year: number;
	term: number;
	section: string | null;
	courseName: string;
	subtitle: string | null;
	professors: Professor[];
}

export interface ReviewPermissions {
	canEdit: boolean;
	canDelete: boolean;
}

export type ReviewUpdate = Partial<Pick<ReviewEntity, 'title' | 'score' | 'comment'>>;
