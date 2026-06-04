import type { ProfessorId, ProfessorCreate, ProfessorEntity } from '$lib/types/professor.type.js';

import { ProfessorModel } from '$lib/models/professor.model.js';
import { toPojo } from '$lib/shared/utils.js';

export async function createProfessor(
	professor: ProfessorCreate
): Promise<ProfessorEntity> {
	return toPojo<ProfessorEntity>((await ProfessorModel.create(professor)).toObject());
}

export async function findProfessorByName(
	professorName: string
): Promise<ProfessorEntity | null> {
	return toPojo<ProfessorEntity | null>(
		await ProfessorModel.findOne({ name: professorName }).lean()
	);
}

export async function findProfessors(): Promise<ProfessorEntity[]> {
	return toPojo<ProfessorEntity[]>(await ProfessorModel.find().sort({ name: 1 }).lean());
}

export async function findProfessorsByIds(
	professorIds: ProfessorId[]
): Promise<Array<ProfessorEntity | null>> {
	const professors = await ProfessorModel.find({ _id: { $in: professorIds } }).lean();

	const professorIdToProfessor = new Map<string, ProfessorEntity>();
	for (const professor of professors) {
		professorIdToProfessor.set(professor._id.toString(), professor);
	}

	return toPojo<Array<ProfessorEntity | null>>(
		professorIds.map(
			(professorId) => professorIdToProfessor.get(professorId.toString()) ?? null
		)
	);
}
