import type { CourseId } from '$lib/course/types';
import type { ProfessorId } from '$lib/professor/types';
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
	displayName?: string | null;
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
export type ReviewUpdate = UpdateQuery<Pick<ReviewBase, 'score' | 'comment'>>;
