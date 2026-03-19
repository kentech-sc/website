import type { UpdateQuery } from 'mongoose';

export type CourseId = string;

export interface CourseCreate {
	_id: CourseId;
	name: string;
	content: string;
}

export type CourseDoc = CourseCreate;

export type Course = CourseDoc;

export type CourseUpdate = UpdateQuery<Pick<CourseDoc, 'name' | 'content'>>;
