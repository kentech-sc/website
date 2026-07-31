import { and, asc, eq, inArray, isNull, sql } from 'drizzle-orm';

import { asEntity, firstOrNull } from './repository.utils.js';

import type {
	IdentityCreate,
	UserCreate,
	UserEntity,
	UserId,
	UserUpdate
} from '$lib/types/user.type.js';

import { userIdentities, users } from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';

export async function createUser(
	userCreate: UserCreate,
	identityCreate: IdentityCreate
): Promise<UserEntity> {
	const [user] = await getDatabase().insert(users).values(userCreate).returning();
	await getDatabase()
		.insert(userIdentities)
		.values({ ...identityCreate, userId: user.id });
	return asEntity<UserEntity>(user);
}

export async function findUserByIdentity(
	issuer: string,
	subject: string
): Promise<UserEntity | null> {
	const rows = await getDatabase()
		.select({ user: users })
		.from(userIdentities)
		.innerJoin(users, eq(userIdentities.userId, users.id))
		.where(and(eq(userIdentities.issuer, issuer), eq(userIdentities.subject, subject)))
		.limit(1);
	return asEntity<UserEntity | null>(rows[0]?.user ?? null);
}

export async function findUserById(userId: UserId): Promise<UserEntity | null> {
	const rows = await getDatabase().select().from(users).where(eq(users.id, userId)).limit(1);
	return asEntity<UserEntity | null>(firstOrNull(rows));
}

export async function findActiveUsers(): Promise<UserEntity[]> {
	const rows = await getDatabase()
		.select()
		.from(users)
		.where(isNull(users.deletedAt))
		.orderBy(asc(users.email), asc(users.createdAt));
	return asEntity<UserEntity[]>(rows);
}

export async function findUserByNickname(nickname: string): Promise<UserEntity | null> {
	const rows = await getDatabase()
		.select()
		.from(users)
		.where(eq(users.nickname, nickname))
		.limit(1);
	return asEntity<UserEntity | null>(firstOrNull(rows));
}

export async function findUsersByIds(userIds: UserId[]): Promise<Array<UserEntity | null>> {
	if (userIds.length === 0) return [];
	const rows = await getDatabase().select().from(users).where(inArray(users.id, userIds));
	const userIdToUser = new Map(rows.map((user) => [user.id, user]));
	return asEntity<Array<UserEntity | null>>(
		userIds.map((userId) => userIdToUser.get(userId) ?? null)
	);
}

export async function findUserIds(): Promise<UserId[]> {
	const rows = await getDatabase().select({ id: users.id }).from(users);
	return rows.map(({ id }) => id);
}

export async function updateUserById(
	userId: UserId,
	userUpdate: UserUpdate
): Promise<UserEntity | null> {
	const rows = await getDatabase()
		.update(users)
		.set({ ...userUpdate, updatedAt: sql`now()` })
		.where(eq(users.id, userId))
		.returning();
	return asEntity<UserEntity | null>(firstOrNull(rows));
}

export async function updateIdentityEmail(
	issuer: string,
	subject: string,
	emailAtLogin: string
): Promise<void> {
	await getDatabase()
		.update(userIdentities)
		.set({ emailAtLogin, updatedAt: sql`now()` })
		.where(and(eq(userIdentities.issuer, issuer), eq(userIdentities.subject, subject)));
}

export async function incrementUserPointsById(
	userId: UserId,
	delta: number
): Promise<UserEntity | null> {
	const rows = await getDatabase()
		.update(users)
		.set({ points: sql`${users.points} + ${delta}`, updatedAt: sql`now()` })
		.where(eq(users.id, userId))
		.returning();
	return asEntity<UserEntity | null>(firstOrNull(rows));
}

export async function deleteUserById(userId: UserId): Promise<boolean> {
	const rows = await getDatabase()
		.update(users)
		.set({
			email: `deleted_${userId}@deleted.invalid`,
			realName: '탈퇴한 사용자',
			nickname: `deleted_${userId}`,
			deletedAt: sql`now()`,
			blockedUntil: null,
			updatedAt: sql`now()`
		})
		.where(eq(users.id, userId))
		.returning({ id: users.id });
	return rows.length > 0;
}
