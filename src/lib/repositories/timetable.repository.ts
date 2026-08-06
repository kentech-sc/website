import { and, asc, countDistinct, eq, inArray, max, sql } from 'drizzle-orm';

import * as AcademicRepository from './academic.repository.js';

import type { Timetable, TimetableCreate } from '$lib/types/timetable.type.js';
import type { UserId } from '$lib/types/user.type.js';

import { timetableItems, timetables } from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';
import { isDuplicateKeyError } from '$lib/server/errors.js';

export async function findTimetables(
	userId: UserId,
	year: number,
	term: number
): Promise<Timetable[]> {
	const rows = await getDatabase()
		.select()
		.from(timetables)
		.where(and(eq(timetables.userId, userId), eq(timetables.year, year), eq(timetables.term, term)))
		.orderBy(asc(timetables.position));
	const ids = rows.map(({ id }) => id);
	const items = ids.length
		? await getDatabase()
				.select()
				.from(timetableItems)
				.where(inArray(timetableItems.timetableId, ids))
		: [];
	const offerings = await AcademicRepository.findOfferings(year, term);
	const offeringMap = new Map(offerings.map((offering) => [offering.id, offering]));
	return rows.map((row) => ({
		...row,
		offerings: items
			.filter((item) => item.timetableId === row.id)
			.map((item) => offeringMap.get(item.offeringId))
			.filter((offering) => offering !== undefined)
	}));
}

export async function findTimetable(id: string, userId: UserId): Promise<Timetable | null> {
	const row = await getDatabase()
		.select()
		.from(timetables)
		.where(and(eq(timetables.id, id), eq(timetables.userId, userId)))
		.limit(1);
	if (!row[0]) return null;
	return (
		(await findTimetables(userId, row[0].year, row[0].term)).find((item) => item.id === id) ?? null
	);
}

export async function findConfirmedCompetition(userId: UserId, year: number, term: number) {
	const [confirmed] = await getDatabase()
		.select({ id: timetables.id, name: timetables.name })
		.from(timetables)
		.where(
			and(
				eq(timetables.userId, userId),
				eq(timetables.year, year),
				eq(timetables.term, term),
				eq(timetables.isConfirmed, true)
			)
		)
		.limit(1);
	if (!confirmed) return { confirmed: false, confirmedTimetableName: null, items: [] };
	const ownItems = await getDatabase()
		.select({ offeringId: timetableItems.offeringId })
		.from(timetableItems)
		.where(eq(timetableItems.timetableId, confirmed.id));
	const offeringIds = ownItems.map((item) => item.offeringId);
	if (!offeringIds.length)
		return { confirmed: true, confirmedTimetableName: confirmed.name, items: [] };
	const counts = await getDatabase()
		.select({
			offeringId: timetableItems.offeringId,
			applicants: countDistinct(timetables.userId)
		})
		.from(timetableItems)
		.innerJoin(timetables, eq(timetableItems.timetableId, timetables.id))
		.where(
			and(
				eq(timetables.year, year),
				eq(timetables.term, term),
				eq(timetables.isConfirmed, true),
				inArray(timetableItems.offeringId, offeringIds)
			)
		)
		.groupBy(timetableItems.offeringId);
	const countMap = new Map(counts.map((row) => [row.offeringId, Number(row.applicants)]));
	const offeringMap = await AcademicRepository.findOfferingMapByIds(offeringIds);
	return {
		confirmed: true,
		confirmedTimetableName: confirmed.name,
		items: offeringIds.flatMap((offeringId) => {
			const offering = offeringMap.get(offeringId);
			return offering ? [{ offering, applicants: countMap.get(offeringId) ?? 0 }] : [];
		})
	};
}

export async function nextPosition(userId: UserId, year: number, term: number): Promise<number> {
	const [row] = await getDatabase()
		.select({ value: max(timetables.position) })
		.from(timetables)
		.where(
			and(eq(timetables.userId, userId), eq(timetables.year, year), eq(timetables.term, term))
		);
	return (row?.value ?? -1) + 1;
}

export async function createTimetable(value: TimetableCreate) {
	const [row] = await getDatabase()
		.insert(timetables)
		.values(value)
		.onConflictDoNothing({
			target: [timetables.userId, timetables.year, timetables.term, timetables.name]
		})
		.returning();
	return row ?? null;
}

export async function updateTimetable(
	id: string,
	userId: UserId,
	value: { name?: string; isConfirmed?: boolean }
) {
	const [row] = await getDatabase()
		.update(timetables)
		.set({ ...value, updatedAt: sql`now()` })
		.where(and(eq(timetables.id, id), eq(timetables.userId, userId)))
		.returning();
	return row ?? null;
}

export async function renameTimetable(id: string, userId: UserId, name: string) {
	try {
		return await updateTimetable(id, userId, { name });
	} catch (error) {
		if (!isDuplicateKeyError(error)) throw error;
		return null;
	}
}

export async function clearConfirmed(userId: UserId, year: number, term: number) {
	await getDatabase()
		.update(timetables)
		.set({ isConfirmed: false, updatedAt: sql`now()` })
		.where(
			and(
				eq(timetables.userId, userId),
				eq(timetables.year, year),
				eq(timetables.term, term),
				eq(timetables.isConfirmed, true)
			)
		);
}

export async function addItem(timetableId: string, offeringId: string) {
	await getDatabase().insert(timetableItems).values({ timetableId, offeringId });
}

export async function removeItem(timetableId: string, offeringId: string) {
	await getDatabase()
		.delete(timetableItems)
		.where(
			and(eq(timetableItems.timetableId, timetableId), eq(timetableItems.offeringId, offeringId))
		);
}

export async function copyItems(fromId: string, toId: string) {
	const items = await getDatabase()
		.select()
		.from(timetableItems)
		.where(eq(timetableItems.timetableId, fromId));
	if (items.length)
		await getDatabase()
			.insert(timetableItems)
			.values(items.map(({ offeringId }) => ({ timetableId: toId, offeringId })));
}

export async function deleteTimetable(id: string, userId: UserId): Promise<boolean> {
	const rows = await getDatabase()
		.delete(timetables)
		.where(and(eq(timetables.id, id), eq(timetables.userId, userId)))
		.returning({ id: timetables.id });
	return rows.length > 0;
}
