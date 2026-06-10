import type { Professor, ProfessorCreate, ProfessorId } from '$lib/types/professor.type.js';
import type { User } from '$lib/types/user.type.js';

import * as ProfessorRepository from '$lib/repositories/professor.repository.js';
import * as ProfessorRule from '$lib/rules/professor.rule.js';
import { assertRule } from '$lib/server/errors.js';

export async function createProfessor(professor: ProfessorCreate, user: User): Promise<Professor> {
	assertRule(ProfessorRule.canManageProfessor(user));

	const duplicate = await ProfessorRepository.findProfessorByName(professor.name);
	assertRule(ProfessorRule.validateProfessorCreate(duplicate !== null));

	return await ProfessorRepository.createProfessor(professor);
}

export async function findProfessors(): Promise<Professor[]> {
	return await ProfessorRepository.findProfessors();
}

export async function findProfessorMapByIds(
	professorIds: ProfessorId[]
): Promise<Map<string, Professor>> {
	const uniqueProfessorIds = Array.from(
		new Set(professorIds.map((professorId) => professorId.toString()))
	);
	if (uniqueProfessorIds.length === 0) return new Map();

	const professors = await ProfessorRepository.findProfessorsByIds(uniqueProfessorIds);
	const professorIdToProfessor = new Map<string, Professor>();

	for (const professor of professors) {
		if (!professor) continue;
		professorIdToProfessor.set(professor._id.toString(), professor);
	}

	return professorIdToProfessor;
}
