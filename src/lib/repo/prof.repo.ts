import type {
	ProfessorId,
	Professor,
	ProfessorCreate,
	ProfessorUpdate
} from '$lib/types/prof.type';
import ProfessorModel from '$lib/models/prof.model.js';

export async function createProfessor(professor: ProfessorCreate): Promise<Professor> {
	return (await ProfessorModel.create(professor)).toObject();
}

export async function getProfessorById(professorId: ProfessorId): Promise<Professor | null> {
	return await ProfessorModel.findOne({ _id: professorId }).lean();
}

export async function getProfessorByName(professorName: string): Promise<Professor | null> {
	return await ProfessorModel.findOne({ name: professorName }).lean();
}

export async function getAllProfessors(): Promise<Professor[]> {
	return await ProfessorModel.find().sort({ name: 1 }).lean();
}

export async function getProfessorsByIds(
	professorIds: ProfessorId[]
): Promise<Array<Professor | null>> {
	const professors = await ProfessorModel.find({ _id: { $in: professorIds } }).lean();

	const professorById = new Map<string, Professor>();
	for (const professor of professors) {
		professorById.set(professor._id.toString(), professor);
	}

	return professorIds.map((professorId) => professorById.get(professorId.toString()) ?? null);
}

export async function updateProfessorById(
	professorId: ProfessorId,
	professor: ProfessorUpdate
): Promise<Professor | null> {
	return await ProfessorModel.findOneAndUpdate({ _id: professorId }, professor, {
		new: true
	}).lean();
}

export async function deleteProfessorById(professorId: ProfessorId): Promise<Professor | null> {
	return await ProfessorModel.findOneAndDelete({ _id: professorId }).lean();
}
