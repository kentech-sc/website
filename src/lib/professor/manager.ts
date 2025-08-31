import type { ProfessorCreate, Professor, ProfessorId, ProfessorUpdate } from './types.js';
import ProfessorController from './controller.js';

export default class ProfessorManager {
	static async createProfessor(professor: ProfessorCreate): Promise<Professor> {
		return await ProfessorController.createProfessor(professor);
	}

	static async getProfessorById(professorId: ProfessorId): Promise<Professor> {
		const professor = await ProfessorController.getProfessorById(professorId);
		if (!professor) throw new Error('존재하지 않는 교수님입니다.');
		return professor;
	}

	static async getAllProfessors(): Promise<Professor[]> {
		const professors = await ProfessorController.getAllProfessors();
		if (!professors) throw new Error('교수님이 존재하지 않습니다.');
		return professors;
	}

	static async getProfessorsByIdsOrNull(
		professorIds: ProfessorId[]
	): Promise<Array<Professor | null>> {
		return await ProfessorController.getProfessorsByIds(professorIds);
	}

	static async updateProfessorById(
		professorId: ProfessorId,
		professor: ProfessorUpdate
	): Promise<Professor> {
		const updatedProfessor = await ProfessorController.updateProfessorById(professorId, professor);
		if (!updatedProfessor) throw new Error('존재하지 않는 교수님입니다.');
		return updatedProfessor;
	}

	static async deleteProfessorById(professorId: ProfessorId): Promise<void> {
		const deletedProfessor = await ProfessorController.deleteProfessorById(professorId);
		if (!deletedProfessor) throw new Error('존재하지 않는 교수님입니다.');
	}

	static async #createProfessorByIdMap<T extends { professorId: ProfessorId }>(
		arr: T[]
	): Promise<Map<string, Professor>> {
		const professorIds = arr.map((item) => item.professorId);
		const professors = await ProfessorController.getProfessorsByIds(professorIds);
		const professorById = new Map<string, Professor>();

		for (const professor of professors) {
			if (!professor) continue;
			if (professorById.has(professor._id.toString())) continue;
			professorById.set(professor._id.toString(), professor);
		}

		return professorById;
	}

	static async fillProfessorNamesByProfessorIds<T extends { professorId: ProfessorId }>(
		arr: T[]
	): Promise<T[]> {
		const professorById = await this.#createProfessorByIdMap(arr);
		return arr.map((item) => {
			const professor = professorById.get(item.professorId.toString());
			return {
				...item,
				professorName: professor?.name ?? '???'
			};
		});
	}
}
