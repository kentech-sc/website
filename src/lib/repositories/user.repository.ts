import { and, asc, eq, inArray, isNull, sql } from 'drizzle-orm';

import { asEntity, firstOrNull } from './repository.utils.js';

import type {
	IdentityCreate,
	UserCreate,
	UserEntity,
	UserId,
	UserUpdate
} from '$lib/types/user.type.js';

import {
	pointAccounts,
	pointLedgerEntries,
	userIdentities,
	userProfiles,
	users
} from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';

const userSelection = {
	id: users.id,
	email: userProfiles.email,
	realName: userProfiles.realName,
	nickname: users.nickname,
	group: users.group,
	blockedUntil: users.blockedUntil,
	deletedAt: users.deletedAt,
	points: pointAccounts.balance,
	createdAt: users.createdAt,
	updatedAt: users.updatedAt
};

async function findUsers(userIds?: UserId[]): Promise<UserEntity[]> {
	let query = getDatabase()
		.select(userSelection)
		.from(users)
		.innerJoin(userProfiles, eq(userProfiles.userId, users.id))
		.innerJoin(pointAccounts, eq(pointAccounts.userId, users.id));

	if (userIds) query = query.where(inArray(users.id, userIds)) as typeof query;
	return asEntity<UserEntity[]>(await query);
}

export async function createUser(
	userCreate: UserCreate,
	identityCreate: IdentityCreate
): Promise<UserEntity> {
	const [user] = await getDatabase()
		.insert(users)
		.values({ nickname: userCreate.nickname, group: userCreate.group })
		.returning();

	await getDatabase().insert(userProfiles).values({
		userId: user.id,
		email: userCreate.email,
		realName: userCreate.realName
	});
	await getDatabase()
		.insert(userIdentities)
		.values({ ...identityCreate, userId: user.id });
	await getDatabase()
		.insert(pointAccounts)
		.values({
			userId: user.id,
			balance: userCreate.points,
			lifetimeEarned: Math.max(userCreate.points, 0),
			lifetimeSpent: Math.max(-userCreate.points, 0)
		});
	if (userCreate.points !== 0) {
		await getDatabase()
			.insert(pointLedgerEntries)
			.values({
				userId: user.id,
				eventType: 'account.signup',
				amount: userCreate.points,
				sourceType: 'user',
				sourceId: user.id,
				idempotencyKey: `account.signup:${user.id}`
			});
	}

	return (await findUserById(user.id))!;
}

export async function findUserByIdentity(
	issuer: string,
	subject: string
): Promise<UserEntity | null> {
	const rows = await getDatabase()
		.select(userSelection)
		.from(userIdentities)
		.innerJoin(users, eq(userIdentities.userId, users.id))
		.innerJoin(userProfiles, eq(userProfiles.userId, users.id))
		.innerJoin(pointAccounts, eq(pointAccounts.userId, users.id))
		.where(and(eq(userIdentities.issuer, issuer), eq(userIdentities.subject, subject)))
		.limit(1);
	return asEntity<UserEntity | null>(firstOrNull(rows));
}

export async function findUserById(userId: UserId): Promise<UserEntity | null> {
	const rows = await findUsers([userId]);
	return rows[0] ?? null;
}

export async function findActiveUsers(): Promise<UserEntity[]> {
	const rows = await getDatabase()
		.select(userSelection)
		.from(users)
		.innerJoin(userProfiles, eq(userProfiles.userId, users.id))
		.innerJoin(pointAccounts, eq(pointAccounts.userId, users.id))
		.where(isNull(users.deletedAt))
		.orderBy(asc(userProfiles.email), asc(users.createdAt));
	return asEntity<UserEntity[]>(rows);
}

export async function findUserByNickname(nickname: string): Promise<UserEntity | null> {
	const rows = await getDatabase()
		.select(userSelection)
		.from(users)
		.innerJoin(userProfiles, eq(userProfiles.userId, users.id))
		.innerJoin(pointAccounts, eq(pointAccounts.userId, users.id))
		.where(eq(users.nickname, nickname))
		.limit(1);
	return asEntity<UserEntity | null>(firstOrNull(rows));
}

export async function findUsersByIds(userIds: UserId[]): Promise<Array<UserEntity | null>> {
	if (userIds.length === 0) return [];
	const rows = await findUsers(userIds);
	const userIdToUser = new Map(rows.map((user) => [user.id, user]));
	return userIds.map((userId) => userIdToUser.get(userId) ?? null);
}

export async function updateUserById(
	userId: UserId,
	userUpdate: UserUpdate
): Promise<UserEntity | null> {
	const { email, realName, ...userFields } = userUpdate;
	if (Object.keys(userFields).length > 0) {
		await getDatabase()
			.update(users)
			.set({ ...userFields, updatedAt: sql`now()` })
			.where(eq(users.id, userId));
	}
	if (email !== undefined || realName !== undefined) {
		await getDatabase()
			.update(userProfiles)
			.set({
				...(email === undefined ? {} : { email }),
				...(realName === undefined ? {} : { realName }),
				updatedAt: sql`now()`
			})
			.where(eq(userProfiles.userId, userId));
	}
	return await findUserById(userId);
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

export async function deleteUserById(userId: UserId): Promise<boolean> {
	const rows = await getDatabase()
		.update(users)
		.set({
			nickname: `deleted_${userId}`,
			deletedAt: sql`now()`,
			blockedUntil: null,
			updatedAt: sql`now()`
		})
		.where(eq(users.id, userId))
		.returning({ id: users.id });
	if (rows.length === 0) return false;

	await getDatabase()
		.update(userProfiles)
		.set({
			email: `deleted_${userId}@deleted.invalid`,
			realName: '탈퇴한 사용자',
			updatedAt: sql`now()`
		})
		.where(eq(userProfiles.userId, userId));
	return true;
}
