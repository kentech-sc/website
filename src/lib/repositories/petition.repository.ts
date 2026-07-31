import { and, asc, desc, eq, ilike, inArray, ne, notInArray, or, sql } from 'drizzle-orm';

import { firstOrNull } from './repository.utils.js';

import type {
	PetitionCreate,
	PetitionEntity,
	PetitionId,
	PetitionStatus
} from '$lib/types/petition.type.js';
import type { UserId } from '$lib/types/user.type.js';

import { petitionSignatures, petitions } from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';

type PetitionRow = typeof petitions.$inferSelect;

async function hydratePetitions(rows: PetitionRow[]): Promise<PetitionEntity[]> {
	if (rows.length === 0) return [];
	const signatures = await getDatabase()
		.select()
		.from(petitionSignatures)
		.where(
			inArray(
				petitionSignatures.petitionId,
				rows.map(({ id }) => id)
			)
		)
		.orderBy(asc(petitionSignatures.createdAt));
	const petitionIdToUserIds = new Map<string, UserId[]>();
	for (const signature of signatures) {
		const userIds = petitionIdToUserIds.get(signature.petitionId) ?? [];
		userIds.push(signature.userId);
		petitionIdToUserIds.set(signature.petitionId, userIds);
	}
	return rows.map((row) => ({
		...row,
		status: row.status as PetitionStatus,
		signedBy: petitionIdToUserIds.get(row.id) ?? []
	}));
}

function searchFilter(query: string) {
	const pattern = `%${query}%`;
	return or(
		ilike(petitions.title, pattern),
		ilike(petitions.content, pattern),
		ilike(petitions.response, pattern)
	)!;
}

async function findHydratedById(petitionId: PetitionId): Promise<PetitionEntity | null> {
	const rows = await getDatabase()
		.select()
		.from(petitions)
		.where(eq(petitions.id, petitionId))
		.limit(1);
	return firstOrNull(await hydratePetitions(rows));
}

export async function countPetitions(): Promise<number> {
	const [result] = await getDatabase()
		.select({ count: sql<number>`count(*)::int` })
		.from(petitions);
	return result.count;
}

export async function countPetitionsByQuery(query: string): Promise<number> {
	const [result] = await getDatabase()
		.select({ count: sql<number>`count(*)::int` })
		.from(petitions)
		.where(searchFilter(query));
	return result.count;
}

export async function createPetition(petition: PetitionCreate): Promise<PetitionEntity> {
	const [created] = await getDatabase().insert(petitions).values(petition).returning();
	return (await hydratePetitions([created]))[0];
}

export async function findPetitionById(petitionId: PetitionId): Promise<PetitionEntity | null> {
	return await findHydratedById(petitionId);
}

export async function findRecentPetitions(limit: number, skip = 0): Promise<PetitionEntity[]> {
	const rows = await getDatabase()
		.select()
		.from(petitions)
		.orderBy(desc(petitions.createdAt))
		.offset(skip)
		.limit(limit);
	return await hydratePetitions(rows);
}

export async function deletePetitionById(petitionId: PetitionId): Promise<boolean> {
	const rows = await getDatabase()
		.delete(petitions)
		.where(eq(petitions.id, petitionId))
		.returning({ id: petitions.id });
	return rows.length > 0;
}

export async function viewPetitionById(petitionId: PetitionId): Promise<PetitionEntity | null> {
	const rows = await getDatabase()
		.update(petitions)
		.set({ viewCnt: sql`${petitions.viewCnt} + 1`, updatedAt: sql`now()` })
		.where(eq(petitions.id, petitionId))
		.returning();
	return firstOrNull(await hydratePetitions(rows));
}

export async function signPetitionById(
	petitionId: PetitionId,
	userId: UserId
): Promise<PetitionEntity | null> {
	const inserted = await getDatabase()
		.insert(petitionSignatures)
		.select(
			getDatabase()
				.select({
					petitionId: petitions.id,
					userId: sql<UserId>`${userId}::uuid`.as('user_id')
				})
				.from(petitions)
				.where(
					and(
						eq(petitions.id, petitionId),
						notInArray(petitions.status, ['answered', 'expired']),
						ne(petitions.petitionerId, userId)
					)
				)
		)
		.onConflictDoNothing()
		.returning({ petitionId: petitionSignatures.petitionId });
	if (inserted.length === 0) return null;
	return await findHydratedById(petitionId);
}

export async function unsignPetitionById(
	petitionId: PetitionId,
	userId: UserId
): Promise<PetitionEntity | null> {
	const deleted = await getDatabase()
		.delete(petitionSignatures)
		.where(
			and(
				eq(petitionSignatures.petitionId, petitionId),
				eq(petitionSignatures.userId, userId),
				sql`exists (
					select 1 from ${petitions}
					where ${petitions.id} = ${petitionId}
						and ${petitions.status} not in ('answered', 'expired')
				)`
			)
		)
		.returning({ petitionId: petitionSignatures.petitionId });
	if (deleted.length === 0) return null;
	return await findHydratedById(petitionId);
}

async function updateStatus(
	petitionId: PetitionId,
	currentStatus: PetitionStatus,
	nextStatus: PetitionStatus
): Promise<PetitionEntity | null> {
	const rows = await getDatabase()
		.update(petitions)
		.set({ status: nextStatus, updatedAt: sql`now()` })
		.where(and(eq(petitions.id, petitionId), eq(petitions.status, currentStatus)))
		.returning();
	return firstOrNull(await hydratePetitions(rows));
}

export async function reviewPetitionById(petitionId: PetitionId): Promise<PetitionEntity | null> {
	return await updateStatus(petitionId, 'pending', 'reviewing');
}

export async function unreviewPetitionById(petitionId: PetitionId): Promise<PetitionEntity | null> {
	return await updateStatus(petitionId, 'reviewing', 'pending');
}

export async function respondToPetitionById(
	petitionId: PetitionId,
	responderId: UserId,
	response: string,
	answeredAt: string
): Promise<PetitionEntity | null> {
	const rows = await getDatabase()
		.update(petitions)
		.set({ responderId, response, status: 'answered', answeredAt, updatedAt: sql`now()` })
		.where(
			and(
				eq(petitions.id, petitionId),
				eq(petitions.status, 'reviewing'),
				sql`${petitions.responderId} is null`
			)
		)
		.returning();
	return firstOrNull(await hydratePetitions(rows));
}

export async function revisePetitionResponseById(
	petitionId: PetitionId,
	responderId: UserId,
	response: string,
	answeredAt: string
): Promise<PetitionEntity | null> {
	const rows = await getDatabase()
		.update(petitions)
		.set({ responderId, response, answeredAt, updatedAt: sql`now()` })
		.where(and(eq(petitions.id, petitionId), sql`${petitions.responderId} is not null`))
		.returning();
	return firstOrNull(await hydratePetitions(rows));
}

export async function deletePetitionResponseById(
	petitionId: PetitionId
): Promise<PetitionEntity | null> {
	const rows = await getDatabase()
		.update(petitions)
		.set({
			responderId: null,
			response: null,
			status: 'reviewing',
			answeredAt: null,
			updatedAt: sql`now()`
		})
		.where(and(eq(petitions.id, petitionId), sql`${petitions.responderId} is not null`))
		.returning();
	return firstOrNull(await hydratePetitions(rows));
}

export async function refreshPetitionStatusById(
	petitionId: PetitionId,
	currentStatus: PetitionStatus,
	signedBy: UserId[],
	nextStatus: PetitionStatus
): Promise<PetitionEntity | null> {
	const rows = await getDatabase()
		.update(petitions)
		.set({ status: nextStatus, updatedAt: sql`now()` })
		.where(
			and(
				eq(petitions.id, petitionId),
				eq(petitions.status, currentStatus),
				sql`(
					select count(*)::int from ${petitionSignatures}
					where ${petitionSignatures.petitionId} = ${petitionId}
				) = ${signedBy.length}`
			)
		)
		.returning();
	return firstOrNull(await hydratePetitions(rows));
}

export async function searchPetitionsByQuery(
	query: string,
	limit = 10,
	skip = 0
): Promise<Array<PetitionEntity & { searchScore?: number }>> {
	const rows = await getDatabase()
		.select()
		.from(petitions)
		.where(searchFilter(query))
		.orderBy(desc(petitions.createdAt))
		.offset(skip)
		.limit(limit);
	return (await hydratePetitions(rows)).map((petition) => ({
		...petition,
		searchScore: 1
	}));
}
