import type { CourseId } from './course.type.js';
import type { ProfessorId } from './professor.type.js';
import type { UserId } from './user.type.js';

export type ReviewId = string;

export interface ReviewScore {
	assignment: number;
	lecture: number;
	exam: number;
	satisfaction: number;
}

export interface ReviewCreate {
	courseId: CourseId;
	professorId: ProfessorId;
	userId: UserId;
	year: number;
	term: number; // 1 ~ 4
	title: string;
	score: ReviewScore;
	comment: string;
}

export interface ReviewEntity extends ReviewCreate {
	_id: ReviewId;
	createdAt: string;
	updatedAt: string;
}

export interface Review extends ReviewEntity {
	courseName: string | null;
	professorName: string | null;
}

export interface ReviewPermissions {
	canEdit: boolean;
	canDelete: boolean;
}

export type ReviewUpdate = Partial<
	Pick<ReviewEntity, 'courseId' | 'professorId' | 'year' | 'term' | 'title' | 'score' | 'comment'>
>;
