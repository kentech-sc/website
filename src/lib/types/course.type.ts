export type CourseId = string;

export interface CourseCreate {
	_id: CourseId;
	name: string;
	content: string;
}

export type CourseEntity = CourseCreate;

export type Course = CourseEntity;

export type CourseUpdate = Partial<Pick<CourseEntity, 'name' | 'content'>>;
