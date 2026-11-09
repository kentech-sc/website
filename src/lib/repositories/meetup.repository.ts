import { and, asc, desc, eq, exists, or, sql } from 'drizzle-orm';

import { asEntity, firstOrNull } from './repository.utils.js';

import type {
	Meetup,
	MeetupCreate,
	MeetupId,
	MeetupResponse,
	MeetupSummary
} from '$lib/types/meetup.type.js';
import type { UserId } from '$lib/types/user.type.js';

import { meetupResponses, meetups, users } from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';

const MEETUP_LIST_LIMIT = 50;

export async function createMeetup(value: MeetupCreate): Promise<Meetup> {
	const [row] = await getDatabase().insert(meetups).values(value).returning();
	return asEntity<Meetup>(row);
}

export async function findMeetup(id: MeetupId): Promise<Meetup | null> {
	const rows = await getDatabase().select().from(meetups).where(eq(meetups.id, id)).limit(1);
	return asEntity<Meetup | null>(firstOrNull(rows));
}

/** 먼저 응답한 사람부터. */
export async function findMeetupResponses(meetupId: MeetupId): Promise<MeetupResponse[]> {
	return await getDatabase()
		.select({
			userId: meetupResponses.userId,
			nickname: users.nickname,
			slots: meetupResponses.slots,
			updatedAt: meetupResponses.updatedAt
		})
		.from(meetupResponses)
		.innerJoin(users, eq(users.id, meetupResponses.userId))
		.where(eq(meetupResponses.meetupId, meetupId))
		.orderBy(asc(meetupResponses.createdAt));
}

export async function upsertMeetupResponse(
	meetupId: MeetupId,
	userId: UserId,
	slots: number[]
): Promise<void> {
	await getDatabase()
		.insert(meetupResponses)
		.values({ meetupId, userId, slots })
		.onConflictDoUpdate({
			target: [meetupResponses.meetupId, meetupResponses.userId],
			set: { slots, updatedAt: sql`now()` }
		});
}

export async function deleteMeetupResponse(meetupId: MeetupId, userId: UserId): Promise<boolean> {
	const rows = await getDatabase()
		.delete(meetupResponses)
		.where(and(eq(meetupResponses.meetupId, meetupId), eq(meetupResponses.userId, userId)))
		.returning({ meetupId: meetupResponses.meetupId });
	return rows.length > 0;
}

/** 내가 만들었거나 응답한 일정. 최근에 만든 것부터. */
export async function findUserMeetups(userId: UserId): Promise<MeetupSummary[]> {
	const db = getDatabase();
	const responded = db
		.select({ meetupId: meetupResponses.meetupId })
		.from(meetupResponses)
		.where(and(eq(meetupResponses.meetupId, meetups.id), eq(meetupResponses.userId, userId)));

	const rows = await db
		.select({
			id: meetups.id,
			creatorId: meetups.creatorId,
			title: meetups.title,
			mode: meetups.mode,
			days: meetups.days,
			responseCount: sql<number>`(select count(*)::int from ${meetupResponses} where ${meetupResponses.meetupId} = ${meetups.id})`,
			createdAt: meetups.createdAt
		})
		.from(meetups)
		.where(or(eq(meetups.creatorId, userId), exists(responded)))
		.orderBy(desc(meetups.createdAt))
		.limit(MEETUP_LIST_LIMIT);
	return asEntity<MeetupSummary[]>(rows);
}

export async function deleteMeetup(id: MeetupId, creatorId: UserId): Promise<boolean> {
	const rows = await getDatabase()
		.delete(meetups)
		.where(and(eq(meetups.id, id), eq(meetups.creatorId, creatorId)))
		.returning({ id: meetups.id });
	return rows.length > 0;
}
