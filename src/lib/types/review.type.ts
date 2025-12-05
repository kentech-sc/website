import type { UpdateQuery, Types } from 'mongoose';

import type { CourseId } from './course.type.js';
import type { ProfessorId } from './prof.type.js';
import type { UserId } from './user.type.js';

export type ReviewId = Types.ObjectId;

export interface ReviewBase {
	courseId: CourseId;
	professorId: ProfessorId;
	userId: UserId;
	year: number;
	term: number; // 1 ~ 4
	title: string;
	score: {
		assignment: number;
		lecture: number;
		exam: number;
	};
	comment: string;
}

export interface Review extends ReviewBase {
	_id: ReviewId;
	createdAt: Date;
	updatedAt: Date;

	courseCode?: string | null;
	courseName?: string | null;
	professorName?: string | null;
}

export type ReviewCreate = ReviewBase;
export type ReviewUpdate = UpdateQuery<
	Pick<ReviewBase, 'year' | 'term' | 'title' | 'score' | 'comment'>
>;
