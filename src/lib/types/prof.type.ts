import type { UpdateQuery, Types } from 'mongoose';

export type ProfessorId = Types.ObjectId;

export interface ProfessorBase {
	name: string;
}

export interface Professor extends ProfessorBase {
	_id: ProfessorId;
}

export type ProfessorCreate = ProfessorBase;
export type ProfessorUpdate = UpdateQuery<Pick<ProfessorBase, 'name'>>;
