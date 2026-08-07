import type { Professor } from '$lib/types/professor.type.js';

import * as ProfessorRepository from '$lib/repositories/professor.repository.js';

export async function findProfessors(): Promise<Professor[]> {
	return await ProfessorRepository.findProfessors();
}
