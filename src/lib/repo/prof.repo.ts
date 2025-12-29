import type {
	ProfessorId,
	ProfessorCreate,
	ProfessorUpdate,
	ProfessorDoc
} from '$lib/types/prof.type.js';

import { ProfessorModel } from '$lib/models/prof.model.js';

export async function createProfessor(professor: ProfessorCreate): Promise<ProfessorDoc> {
	return (await ProfessorModel.create(professor)).toObject();
}

export async function getProfessorById(professorId: ProfessorId): Promise<ProfessorDoc | null> {
	return await ProfessorModel.findOne({ _id: professorId }).lean();
}

export async function getProfessorByName(professorName: string): Promise<ProfessorDoc | null> {
	return await ProfessorModel.findOne({ name: professorName }).lean();
}

export async function getAllProfessors(): Promise<ProfessorDoc[]> {
	return await ProfessorModel.find().sort({ name: 1 }).lean();
}

export async function getProfessorsByIds(
	professorIds: ProfessorId[]
): Promise<Array<ProfessorDoc | null>> {
	const professors = await ProfessorModel.find({ _id: { $in: professorIds } }).lean();

	const professorById = new Map<string, ProfessorDoc>();
	for (const professor of professors) {
		professorById.set(professor._id.toString(), professor);
	}

	return professorIds.map((professorId) => professorById.get(professorId.toString()) ?? null);
}

export async function updateProfessorById(
	professorId: ProfessorId,
	professor: ProfessorUpdate
): Promise<ProfessorDoc | null> {
	return await ProfessorModel.findOneAndUpdate({ _id: professorId }, professor, {
		new: true
	}).lean();
}

export async function deleteProfessorById(professorId: ProfessorId): Promise<boolean> {
	const res = await ProfessorModel.deleteOne({ _id: professorId });
	return res.deletedCount > 0;
}
