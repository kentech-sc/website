import type { ProfessorCreate, Professor, ProfessorId, ProfessorUpdate } from './types.js';
import ProfessorRepository from './repository.js';

export default class ProfessorService {
	static async createProfessor(professor: ProfessorCreate): Promise<Professor> {
		return await ProfessorRepository.createProfessor(professor);
	}

	static async getProfessorById(professorId: ProfessorId): Promise<Professor> {
		const professor = await ProfessorRepository.getProfessorById(professorId);
		if (!professor) throw new Error('존재하지 않는 교수님입니다.');
		return professor;
	}

	static async getAllProfessors(): Promise<Professor[]> {
		const professors = await ProfessorRepository.getAllProfessors();
		return professors;
	}

	static async getProfessorsByIdsOrNull(
		professorIds: ProfessorId[]
	): Promise<Array<Professor | null>> {
		return await ProfessorRepository.getProfessorsByIds(professorIds);
	}

	static async updateProfessorById(
		professorId: ProfessorId,
		professor: ProfessorUpdate
	): Promise<Professor> {
		const updatedProfessor = await ProfessorRepository.updateProfessorById(professorId, professor);
		if (!updatedProfessor) throw new Error('존재하지 않는 교수님입니다.');
		return updatedProfessor;
	}

	static async deleteProfessorById(professorId: ProfessorId): Promise<void> {
		const deletedProfessor = await ProfessorRepository.deleteProfessorById(professorId);
		if (!deletedProfessor) throw new Error('존재하지 않는 교수님입니다.');
	}

	static async #createProfessorByIdMap<T extends { professorId: ProfessorId }>(
		arr: T[]
	): Promise<Map<string, Professor>> {
		const professorIds = arr.map((item) => item.professorId);
		const professors = await ProfessorRepository.getProfessorsByIds(professorIds);
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
				professorName: professor?.name ?? null
			};
		});
	}
}
