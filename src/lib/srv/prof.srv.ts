import type {
	ProfessorCreate,
	Professor,
	ProfessorId,
	ProfessorUpdate
} from '$lib/types/prof.type.js';
import type { User } from '$lib/types/user.type.js';

import { RuleError, SrvError } from '$lib/common/errors.js';

import * as ProfRepository from '$lib/repo/prof.repo.js';
import * as ProfRule from '$lib/rules/prof.rule.js';

export async function createProfessor(professor: ProfessorCreate, user: User): Promise<Professor> {
	if (!ProfRule.canManageProfessor(user)) throw new RuleError('권한이 없습니다.');
	if (await getProfessorOrNullByName(professor.name))
		throw new RuleError('이미 존재하는 교수님입니다.');
	return await ProfRepository.createProfessor(professor);
}

export async function getProfessorByName(professorName: string): Promise<Professor> {
	const professor = await ProfRepository.getProfessorByName(professorName);
	if (!professor) throw new SrvError('존재하지 않는 교수님입니다.');
	return professor;
}

export async function getProfessorById(professorId: ProfessorId): Promise<Professor> {
	const professor = await ProfRepository.getProfessorById(professorId);
	if (!professor) throw new SrvError('존재하지 않는 교수님입니다.');
	return professor;
}

export async function getProfessorOrNullByName(professorName: string): Promise<Professor | null> {
	const professor = await ProfRepository.getProfessorByName(professorName);
	return professor;
}

export async function getAllProfessors(): Promise<Professor[]> {
	return await ProfRepository.getAllProfessors();
}

// export async function getProfessorsOrNullByIds(
// 	professorIds: ProfessorId[]
// ): Promise<Array<Professor | null>> {
// 	return await ProfRepository.getProfessorsByIds(professorIds);
// }

export async function updateProfessorById(
	professorId: ProfessorId,
	professor: ProfessorUpdate,
	user: User
): Promise<Professor> {
	if (!ProfRule.canManageProfessor(user)) throw new RuleError('권한이 없습니다.');
	const updatedProfessor = await ProfRepository.updateProfessorById(professorId, professor);
	if (!updatedProfessor) throw new SrvError('존재하지 않는 교수님입니다.');
	return updatedProfessor;
}

export async function deleteProfessorById(professorId: ProfessorId, user: User): Promise<void> {
	if (!ProfRule.canManageProfessor(user)) throw new RuleError('권한이 없습니다.');
	const deletedProfessor = await ProfRepository.deleteProfessorById(professorId);
	if (!deletedProfessor) throw new SrvError('존재하지 않는 교수님입니다.');
}

export async function createProfessorByIdMap<T extends { professorId: ProfessorId }>(
	arr: T[]
): Promise<Map<string, Professor>> {
	const professorIds = arr.map((item) => item.professorId);
	const professors = await ProfRepository.getProfessorsByIds(professorIds);
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
