import { eq, lt, sql } from 'drizzle-orm';

import type { PointEntryCreate } from '$lib/types/point.type.js';
import type { UserId } from '$lib/types/user.type.js';

import {
	pointAccounts,
	pointDailyEventCounts,
	pointLedgerEntries
} from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';

export async function incrementDailyEventCount(
	userId: UserId,
	dateKey: string,
	eventType: string,
	limit: number
): Promise<boolean> {
	const rows = await getDatabase()
		.insert(pointDailyEventCounts)
		.values({ userId, dateKey, eventType, count: 1 })
		.onConflictDoUpdate({
			target: [
				pointDailyEventCounts.userId,
				pointDailyEventCounts.dateKey,
				pointDailyEventCounts.eventType
			],
			set: {
				count: sql`${pointDailyEventCounts.count} + 1`,
				updatedAt: sql`now()`
			},
			setWhere: lt(pointDailyEventCounts.count, limit)
		})
		.returning({ count: pointDailyEventCounts.count });
	return rows.length > 0;
}

export async function applyEntry(entry: PointEntryCreate): Promise<boolean> {
	const insert = getDatabase().insert(pointLedgerEntries).values(entry);
	const rows = entry.idempotencyKey
		? await insert
				.onConflictDoNothing({ target: pointLedgerEntries.idempotencyKey })
				.returning({ id: pointLedgerEntries.id })
		: await insert.returning({ id: pointLedgerEntries.id });
	if (rows.length === 0) return false;

	const earned = Math.max(entry.amount, 0);
	const spent = Math.max(-entry.amount, 0);
	const accounts = await getDatabase()
		.update(pointAccounts)
		.set({
			balance: sql`${pointAccounts.balance} + ${entry.amount}`,
			lifetimeEarned: sql`${pointAccounts.lifetimeEarned} + ${earned}`,
			lifetimeSpent: sql`${pointAccounts.lifetimeSpent} + ${spent}`,
			updatedAt: sql`now()`
		})
		.where(eq(pointAccounts.userId, entry.userId))
		.returning({ userId: pointAccounts.userId });
	return accounts.length > 0;
}
