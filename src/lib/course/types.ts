import type { UpdateQuery, Types } from 'mongoose';

export type CourseId = Types.ObjectId;

export interface CourseBase {
	code: string;
	name: string;
	content: string;
}

export interface Course extends CourseBase {
	_id: CourseId;
}

export type CourseCreate = CourseBase;
export type CourseUpdate = UpdateQuery<Pick<CourseBase, 'code' | 'name' | 'content'>>;
