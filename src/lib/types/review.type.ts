import type { UpdateQuery, Types } from 'mongoose';

import type { CourseId } from './course.type.js';
import type { ProfessorId } from './prof.type.js';
import type { UserId } from './user.type.js';

export type ReviewId = Types.ObjectId;

export interface ReviewCreate {
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

export interface ReviewDoc extends ReviewCreate {
	_id: ReviewId;
	createdAt: Date;
	updatedAt: Date;
}

export interface Review extends ReviewDoc {
	courseCode: string | null;
	courseName: string | null;
	professorName: string | null;
}

export type ReviewUpdate = UpdateQuery<
	Pick<ReviewDoc, 'year' | 'term' | 'title' | 'score' | 'comment'>
>;
