import { and, eq, lt, ne, sql } from 'drizzle-orm';

import { asEntity, firstOrNull } from './repository.utils.js';

import type {
	PointCapKind,
	PointStateCreate,
	PointStateEntity
} from '$lib/types/point-state.type.js';
import type { UserId } from '$lib/types/user.type.js';

import { pointStates } from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';

type PointStateRow = typeof pointStates.$inferSelect;

const kindToColumn = {
	post: pointStates.postCount,
	comment: pointStates.commentCount,
	review: pointStates.reviewCount,
	petition: pointStates.petitionCount
} as const;

const kindToField = {
	post: 'postCount',
	comment: 'commentCount',
	review: 'reviewCount',
	petition: 'petitionCount'
} as const;

function toPointState(row: PointStateRow): PointStateEntity {
	return asEntity<PointStateEntity>({
		id: row.id,
		userId: row.userId,
		dateKey: row.dateKey,
		counts: {
			post: row.postCount,
			comment: row.commentCount,
			review: row.reviewCount,
			petition: row.petitionCount
		},
		createdAt: row.createdAt,
		updatedAt: row.updatedAt
	});
}

function toPointStateValues(state: PointStateCreate) {
	return {
		userId: state.userId,
		dateKey: state.dateKey,
		postCount: state.counts.post,
		commentCount: state.counts.comment,
		reviewCount: state.counts.review,
		petitionCount: state.counts.petition
	};
}

export async function findPointStateByUserId(userId: UserId): Promise<PointStateEntity | null> {
	const rows = await getDatabase()
		.select()
		.from(pointStates)
		.where(eq(pointStates.userId, userId))
		.limit(1);
	const row = firstOrNull(rows);
	return row ? toPointState(row) : null;
}

export async function createPointState(state: PointStateCreate): Promise<PointStateEntity> {
	const [created] = await getDatabase()
		.insert(pointStates)
		.values(toPointStateValues(state))
		.returning();
	return toPointState(created);
}

export async function updatePointStateByUserIdAndDateKey(
	userId: UserId,
	dateKey: string,
	kind: PointCapKind,
	limit: number
): Promise<PointStateEntity | null> {
	const column = kindToColumn[kind];
	const field = kindToField[kind];
	const rows = await getDatabase()
		.update(pointStates)
		.set({ [field]: sql`${column} + 1`, updatedAt: sql`now()` })
		.where(and(eq(pointStates.userId, userId), eq(pointStates.dateKey, dateKey), lt(column, limit)))
		.returning();
	const row = firstOrNull(rows);
	return row ? toPointState(row) : null;
}

export async function resetPointStateByUserId(
	userId: UserId,
	state: PointStateCreate
): Promise<PointStateEntity | null> {
	const rows = await getDatabase()
		.update(pointStates)
		.set({ ...toPointStateValues(state), updatedAt: sql`now()` })
		.where(and(eq(pointStates.userId, userId), ne(pointStates.dateKey, state.dateKey)))
		.returning();
	const row = firstOrNull(rows);
	return row ? toPointState(row) : null;
}
