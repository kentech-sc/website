import type { ProfessorId, Professor, ProfessorCreate, ProfessorUpdate } from './types.js';
import ProfessorModel from './model.js';

export default class ProfessorRepository {
	static async createProfessor(professor: ProfessorCreate): Promise<Professor> {
		return (await ProfessorModel.create(professor)).toObject();
	}

	static async getProfessorById(professorId: ProfessorId): Promise<Professor | null> {
		return await ProfessorModel.findOne({ _id: professorId }).lean();
	}

	static async getProfessorByName(professorName: string): Promise<Professor | null> {
		return await ProfessorModel.findOne({ name: professorName }).lean();
	}

	static async getAllProfessors(): Promise<Professor[]> {
		return await ProfessorModel.find().sort({ name: 1 }).lean();
	}

	static async getProfessorsByIds(professorIds: ProfessorId[]): Promise<Array<Professor | null>> {
		const professors = await ProfessorModel.find({ _id: { $in: professorIds } }).lean();

		const professorById = new Map<string, Professor>();
		for (const professor of professors) {
			professorById.set(professor._id.toString(), professor);
		}

		return professorIds.map((professorId) => professorById.get(professorId.toString()) ?? null);
	}

	static async updateProfessorById(
		professorId: ProfessorId,
		professor: ProfessorUpdate
	): Promise<Professor | null> {
		return await ProfessorModel.findOneAndUpdate({ _id: professorId }, professor, {
			new: true
		}).lean();
	}

	static async deleteProfessorById(professorId: ProfessorId): Promise<Professor | null> {
		return await ProfessorModel.findOneAndDelete({ _id: professorId }).lean();
	}
}
