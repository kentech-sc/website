import type { ProfessorCreate, Professor, ProfessorId, ProfessorUpdate } from './types.js';
import ProfessorRepository from './repository.js';
import type { User } from '$lib/user/types.js';

export default class ProfessorService {
	static #canManageProfessor(user: User): boolean {
		return user.group === 'manager';
	}

	static async createProfessor(professor: ProfessorCreate, user: User): Promise<Professor> {
		if (!this.#canManageProfessor(user)) throw new Error('권한이 없습니다.');
		if (await this.getProfessorByName(professor.name)) throw new Error('이미 존재하는 교수님입니다.');
		return await ProfessorRepository.createProfessor(professor);
	}

	static async getProfessorByName(professorName: string): Promise<Professor> {
		const professor = await ProfessorRepository.getProfessorByName(professorName);
		if (!professor) throw new Error('존재하지 않는 교수님입니다.');
		return professor;
	}

	static async getProfessorById(professorId: ProfessorId): Promise<Professor> {
		const professor = await ProfessorRepository.getProfessorById(professorId);
		if (!professor) throw new Error('존재하지 않는 교수님입니다.');
		return professor;
	}

	static async getAllProfessors(): Promise<Professor[]> {
		return await ProfessorRepository.getAllProfessors();
	}

	static async getProfessorsByIdsOrNull(
		professorIds: ProfessorId[]
	): Promise<Array<Professor | null>> {
		return await ProfessorRepository.getProfessorsByIds(professorIds);
	}

	static async updateProfessorById(
		professorId: ProfessorId,
		professor: ProfessorUpdate,
		user: User
	): Promise<Professor> {
		if (!this.#canManageProfessor(user)) throw new Error('권한이 없습니다.');
		const updatedProfessor = await ProfessorRepository.updateProfessorById(professorId, professor);
		if (!updatedProfessor) throw new Error('존재하지 않는 교수님입니다.');
		return updatedProfessor;
	}

	static async deleteProfessorById(professorId: ProfessorId, user: User): Promise<void> {
		if (!this.#canManageProfessor(user)) throw new Error('권한이 없습니다.');
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
