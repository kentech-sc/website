import { asc, inArray } from 'drizzle-orm';

import { asEntity } from './repository.utils.js';

import type { ProfessorEntity, ProfessorId } from '$lib/types/professor.type.js';

import { professors } from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';

export async function findProfessors(): Promise<ProfessorEntity[]> {
	return asEntity<ProfessorEntity[]>(
		await getDatabase().select().from(professors).orderBy(asc(professors.name))
	);
}

export async function findProfessorsByIds(
	professorIds: ProfessorId[]
): Promise<Array<ProfessorEntity | null>> {
	if (professorIds.length === 0) return [];
	const rows = await getDatabase()
		.select()
		.from(professors)
		.where(inArray(professors.id, professorIds));
	const professorIdToProfessor = new Map(rows.map((professor) => [professor.id, professor]));
	return asEntity<Array<ProfessorEntity | null>>(
		professorIds.map((professorId) => professorIdToProfessor.get(professorId) ?? null)
	);
}
