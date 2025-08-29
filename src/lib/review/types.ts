import type { CourseId, ProfessorId } from '$lib/course/types';
import type { UserId } from '$lib/user/types';
import type { UpdateQuery, Types } from 'mongoose';
import type { DisplayType } from '$lib/user/types';

export type ReviewId = Types.ObjectId;

export interface ReviewBase {
	courseId: CourseId;
	professorId: ProfessorId;
	userId: UserId;
	score: number;
	comment: string;
	displayType?: DisplayType;
	displayName?: string;
	courseCode?: string;
	courseName?: string;
	professorName?: string;
}

export interface Review extends ReviewBase {
	_id: ReviewId;
	createdAt: Date;
	updatedAt: Date;
}

export type ReviewCreate = ReviewBase;
export type ReviewUpdate = UpdateQuery<Pick<ReviewBase, 'score' | 'comment'>>;
