import type { UpdateQuery, Types } from 'mongoose';

export type ProfessorId = Types.ObjectId;

export interface ProfessorCreate {
	name: string;
}

export interface ProfessorDoc extends ProfessorCreate {
	_id: ProfessorId;
}

export type Professor = ProfessorDoc;

export type ProfessorUpdate = UpdateQuery<Pick<ProfessorDoc, 'name'>>;
