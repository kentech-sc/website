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

	const isDeleted = await ProfRepository.deleteProfessorById(professorId);
	if (!isDeleted) throw new SrvError('존재하지 않는 교수님입니다.');
}

export async function getProfessorMapByIds(
	professorIds: ProfessorId[]
): Promise<Map<string, Professor>> {
	const professors = await ProfRepository.getProfessorsByIds(professorIds);

	const map = new Map<string, Professor>();
	for (const professor of professors) {
		if (!professor) continue;
		map.set(professor._id.toString(), professor);
	}

	return map;
}

// Array<{ ... , professorId }>를 받음. 각 item의 professorId로 professor 정보를 item에 추가하여 반환.
export async function attachProfessorInfo<T extends { professorId: ProfessorId }>(
	arr: T[]
): Promise<(T & { professorName: string | null })[]> {
	const professorMap = await getProfessorMapByIds(arr.map((item) => item.professorId));

	return arr.map((item) => {
		const professor = professorMap.get(item.professorId.toString());
		return {
			...item,
			professorName: professor?.name ?? null
		};
	});
}
