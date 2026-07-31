export type ProfessorId = string;

export interface ProfessorCreate {
	name: string;
}

export interface ProfessorEntity extends ProfessorCreate {
	id: ProfessorId;
}

export type Professor = ProfessorEntity;
