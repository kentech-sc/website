import { and, eq, inArray, lte, sql } from 'drizzle-orm';

import { asEntity, firstOrNull } from './repository.utils.js';

import type { ThrottleBucket, ThrottleCreate, ThrottleEntity } from '$lib/types/throttle.type.js';
import type { UserId } from '$lib/types/user.type.js';

import { throttles } from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';

export async function createThrottle(throttle: ThrottleCreate): Promise<ThrottleEntity> {
	const [created] = await getDatabase().insert(throttles).values(throttle).returning();
	return asEntity<ThrottleEntity>(created);
}

export async function findThrottlesByUserIds(userIds: UserId[]): Promise<ThrottleEntity[]> {
	if (userIds.length === 0) return [];
	return asEntity<ThrottleEntity[]>(
		await getDatabase().select().from(throttles).where(inArray(throttles.userId, userIds))
	);
}

export async function updateThrottleByUserIdAndBucket(
	userId: UserId,
	bucket: ThrottleBucket,
	now: string,
	availableAt: string
): Promise<ThrottleEntity | null> {
	const rows = await getDatabase()
		.update(throttles)
		.set({ availableAt, updatedAt: sql`now()` })
		.where(
			and(
				eq(throttles.userId, userId),
				eq(throttles.bucket, bucket),
				lte(throttles.availableAt, now)
			)
		)
		.returning();
	return asEntity<ThrottleEntity | null>(firstOrNull(rows));
}

export async function findThrottleByUserIdAndBucket(
	userId: UserId,
	bucket: ThrottleBucket
): Promise<ThrottleEntity | null> {
	const rows = await getDatabase()
		.select()
		.from(throttles)
		.where(and(eq(throttles.userId, userId), eq(throttles.bucket, bucket)))
		.limit(1);
	return asEntity<ThrottleEntity | null>(firstOrNull(rows));
}
