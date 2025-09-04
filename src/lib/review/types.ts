import type { CourseId } from '$lib/course/types';
import type { ProfessorId } from '$lib/professor/types';
import type { UserId } from '$lib/user/types';
import type { UpdateQuery, Types } from 'mongoose';

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
	courseCode?: string | null;
	courseName?: string | null;
	professorName?: string | null;
}

export interface Review extends ReviewBase {
	_id: ReviewId;
	createdAt: Date;
	updatedAt: Date;
}

export type ReviewCreate = ReviewBase;
export type ReviewUpdate = UpdateQuery<
	Pick<ReviewBase, 'year' | 'term' | 'title' | 'score' | 'comment'>
>;
