import type { UpdateQuery, Types } from 'mongoose';

export type CourseId = Types.ObjectId;

export interface CourseCreate {
	code: string;
	name: string;
	content: string;
}

export interface CourseDoc extends CourseCreate {
	_id: CourseId;
}

export type Course = CourseDoc;

export type CourseUpdate = UpdateQuery<Pick<CourseDoc, 'code' | 'name' | 'content'>>;
