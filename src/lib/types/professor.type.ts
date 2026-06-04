export type ProfessorId = string;

export interface ProfessorCreate {
	name: string;
}

export interface ProfessorEntity extends ProfessorCreate {
	_id: ProfessorId;
}

export type Professor = ProfessorEntity;

export type ProfessorUpdate = Partial<Pick<ProfessorEntity, 'name'>>;
