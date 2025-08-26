import type { UserId } from '$lib/user/types';
import type { UpdateQuery, Types } from 'mongoose';

export type ReviewId = Types.ObjectId;
export type CourseId = Types.ObjectId;

export interface CourseBase {
	title: string;
	content: string;
	professor: string;
	totalScore: number;
	reviewCnt: number;
}

export interface Course extends CourseBase {
	_id: CourseId;
	createdAt: Date;
	updatedAt: Date;
}

export type CourseCreate = CourseBase;
export type CourseUpdate = UpdateQuery<Pick<CourseBase, 'title' | 'content' | 'professor'>>;

export interface ReviewBase {
	courseId: CourseId;
	userId: UserId;
	score: number;
	comment: string;
	userName?: string;
}

export interface Review extends ReviewBase {
	_id: ReviewId;
	createdAt: Date;
	updatedAt: Date;
}

export type ReviewCreate = ReviewBase;
export type ReviewUpdate = UpdateQuery<Pick<ReviewBase, 'score' | 'comment'>>;
