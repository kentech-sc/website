export type CourseId = string;

export interface CourseCreate {
	id: CourseId;
	name: string;
	content: string;
}

export type CourseEntity = CourseCreate;

export type Course = CourseEntity;
