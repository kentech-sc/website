import type { Professor, ProfessorId } from '$lib/types/professor.type.js';

import * as ProfessorRepository from '$lib/repositories/professor.repository.js';

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
		professorIdToProfessor.set(professor.id.toString(), professor);
	}

	return professorIdToProfessor;
}
