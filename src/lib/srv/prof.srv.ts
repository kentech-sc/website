import type {
	ProfessorCreate,
	Professor,
	ProfessorId,
	ProfessorUpdate
} from '$lib/types/prof.type.js';
import type { User } from '$lib/types/user.type.js';

import { UserGroup } from '$lib/types/user.type.js';

import * as ProfessorRepository from '$lib/repo/prof.repo.js';

export function canManageProfessor(user: User): boolean {
	return user.group === UserGroup.Manager;
}

export async function createProfessor(professor: ProfessorCreate, user: User): Promise<Professor> {
	if (!canManageProfessor(user)) throw new Error('권한이 없습니다.');
	if (await getProfessorByName(professor.name)) throw new Error('이미 존재하는 교수님입니다.');
	return await ProfessorRepository.createProfessor(professor);
}

export async function getProfessorByName(professorName: string): Promise<Professor> {
	const professor = await ProfessorRepository.getProfessorByName(professorName);
	if (!professor) throw new Error('존재하지 않는 교수님입니다.');
	return professor;
}

export async function getProfessorById(professorId: ProfessorId): Promise<Professor> {
	const professor = await ProfessorRepository.getProfessorById(professorId);
	if (!professor) throw new Error('존재하지 않는 교수님입니다.');
	return professor;
}

export async function getAllProfessors(): Promise<Professor[]> {
	return await ProfessorRepository.getAllProfessors();
}

export async function getProfessorsByIdsOrNull(
	professorIds: ProfessorId[]
): Promise<Array<Professor | null>> {
	return await ProfessorRepository.getProfessorsByIds(professorIds);
}

export async function updateProfessorById(
	professorId: ProfessorId,
	professor: ProfessorUpdate,
	user: User
): Promise<Professor> {
	if (!canManageProfessor(user)) throw new Error('권한이 없습니다.');
	const updatedProfessor = await ProfessorRepository.updateProfessorById(professorId, professor);
	if (!updatedProfessor) throw new Error('존재하지 않는 교수님입니다.');
	return updatedProfessor;
}

export async function deleteProfessorById(professorId: ProfessorId, user: User): Promise<void> {
	if (!canManageProfessor(user)) throw new Error('권한이 없습니다.');
	const deletedProfessor = await ProfessorRepository.deleteProfessorById(professorId);
	if (!deletedProfessor) throw new Error('존재하지 않는 교수님입니다.');
}

export async function createProfessorByIdMap<T extends { professorId: ProfessorId }>(
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

export async function fillProfessorNamesByProfessorIds<T extends { professorId: ProfessorId }>(
	arr: T[]
): Promise<T[]> {
	const professorById = await createProfessorByIdMap(arr);
	return arr.map((item) => {
		const professor = professorById.get(item.professorId.toString());
		return {
			...item,
			professorName: professor?.name ?? null
		};
	});
}
