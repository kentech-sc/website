import type { UpdateQuery, Types } from 'mongoose';

export type CourseId = Types.ObjectId;
export type ProfessorId = Types.ObjectId;

export interface CourseBase {
	code: string;
	name: string;
	content: string;
}

export interface Course extends CourseBase {
	_id: CourseId;
}

export interface ProfessorBase {
	name: string;
}

export interface Professor extends ProfessorBase {
	_id: ProfessorId;
}

export type CourseCreate = CourseBase;
export type CourseUpdate = UpdateQuery<Pick<CourseBase, 'code' | 'name' | 'content'>>;

export type ProfessorCreate = ProfessorBase;
export type ProfessorUpdate = UpdateQuery<Pick<ProfessorBase, 'name'>>;
