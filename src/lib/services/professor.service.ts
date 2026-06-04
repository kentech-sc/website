import type { Professor, ProfessorCreate, ProfessorId } from '$lib/types/professor.type.js';
import type { User } from '$lib/types/user.type.js';

import { assertRule } from '$lib/server/errors.js';

import * as ProfessorRepository from '$lib/repositories/professor.repository.js';
import * as ProfessorRule from '$lib/rules/professor.rule.js';

export async function createProfessor(
	professor: ProfessorCreate,
	user: User
): Promise<Professor> {
	assertRule(ProfessorRule.canManageProfessor(user));

	const duplicate = await ProfessorRepository.findProfessorByName(professor.name);
	assertRule(ProfessorRule.validateProfessorCreate(duplicate !== null));

	return await ProfessorRepository.createProfessor(professor);
}

export async function findProfessors(): Promise<Professor[]> {
	return await ProfessorRepository.findProfessors();
}

async function getProfessorIdToProfessor(
	professorIds: ProfessorId[]
): Promise<Map<string, Professor>> {
	const professors = await ProfessorRepository.findProfessorsByIds(professorIds);

	const professorIdToProfessor = new Map<string, Professor>();
	for (const professor of professors) {
		if (!professor) continue;
		professorIdToProfessor.set(professor._id.toString(), professor);
	}

	return professorIdToProfessor;
}

export async function attachProfessorInfo<T extends { professorId: ProfessorId }>(
	items: T[]
): Promise<(T & { professorName: string | null })[]> {
	const professorIdToProfessor = await getProfessorIdToProfessor(
		items.map((item) => item.professorId)
	);

	return items.map((item) => {
		const professor = professorIdToProfessor.get(item.professorId.toString());
		return {
			...item,
			professorName: professor?.name ?? null
		};
	});
}
