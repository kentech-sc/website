import { asc, eq, inArray } from 'drizzle-orm';

import { asEntity, firstOrNull } from './repository.utils.js';

import type { ProfessorCreate, ProfessorEntity, ProfessorId } from '$lib/types/professor.type.js';

import { professors } from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';

export async function createProfessor(professor: ProfessorCreate): Promise<ProfessorEntity> {
	const [created] = await getDatabase().insert(professors).values(professor).returning();
	return asEntity<ProfessorEntity>(created);
}

export async function findProfessorByName(name: string): Promise<ProfessorEntity | null> {
	const rows = await getDatabase()
		.select()
		.from(professors)
		.where(eq(professors.name, name))
		.limit(1);
	return asEntity<ProfessorEntity | null>(firstOrNull(rows));
}

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
