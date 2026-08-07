import { asc } from 'drizzle-orm';

import { asEntity } from './repository.utils.js';

import type { ProfessorEntity } from '$lib/types/professor.type.js';

import { professors } from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';

export async function findProfessors(): Promise<ProfessorEntity[]> {
	return asEntity<ProfessorEntity[]>(
		await getDatabase().select().from(professors).orderBy(asc(professors.name))
	);
}
