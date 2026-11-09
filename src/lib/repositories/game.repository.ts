import { and, eq, isNull, sql } from 'drizzle-orm';

import type { GameId, GameLeaderboard, GameStanding, GameRunState } from '$lib/types/game.type.js';

import { gameRecords, gameSessions, users } from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';

export async function createGameSession(
	userId: string,
	game: GameId,
	seed: number,
	roundState: GameRunState
) {
	const [session] = await getDatabase()
		.insert(gameSessions)
		.values({ userId, game, seed, roundState })
		.onConflictDoUpdate({
			target: [gameSessions.userId, gameSessions.game],
			set: {
				id: sql`gen_random_uuid()`,
				seed,
				roundState,
				startedAt: sql`now()`,
				completedAt: null,
				completedScore: null
			}
		})
		.returning();
	return session;
}

export async function findGameSession(id: string, userId: string) {
	const [session] = await getDatabase()
		.select()
		.from(gameSessions)
		.where(and(eq(gameSessions.id, id), eq(gameSessions.userId, userId)))
		.limit(1);
	return session ?? null;
}

export async function updateGameRoundState(
	id: string,
	userId: string,
	next: GameRunState | null,
	expected?: GameRunState
): Promise<boolean> {
	const rows = await getDatabase()
		.update(gameSessions)
		.set({ roundState: next })
		.where(
			and(
				eq(gameSessions.id, id),
				eq(gameSessions.userId, userId),
				isNull(gameSessions.completedAt),
				expected && eq(gameSessions.roundState, expected)
			)
		)
		.returning({ id: gameSessions.id });
	return rows.length === 1;
}

export async function completeGameSession(
	id: string,
	userId: string,
	score: number,
	roundState: GameRunState
): Promise<boolean> {
	const rows = await getDatabase()
		.update(gameSessions)
		.set({ completedAt: sql`now()`, completedScore: score })
		.where(
			and(
				eq(gameSessions.id, id),
				eq(gameSessions.userId, userId),
				isNull(gameSessions.completedAt),
				eq(gameSessions.roundState, roundState)
			)
		)
		.returning({ id: gameSessions.id });
	return rows.length === 1;
}

export async function upsertGameRecord(userId: string, game: GameId, week: string, score: number) {
	const better =
		game === 'reaction'
			? sql`excluded.score < ${gameRecords.score}`
			: sql`excluded.score > ${gameRecords.score}`;
	const rows = await getDatabase()
		.insert(gameRecords)
		.values({ userId, game, week, score })
		.onConflictDoUpdate({
			target: [gameRecords.userId, gameRecords.game, gameRecords.week],
			set: { score, achievedAt: sql`now()` },
			setWhere: better
		})
		.returning({ score: gameRecords.score });
	return rows.length === 1;
}

export async function findGameLeaderboard(
	game: GameId,
	week: string | null,
	userId: string
): Promise<GameLeaderboard> {
	const aggregate = game === 'reaction' ? sql`min(r.score)` : sql`max(r.score)`;
	const direction = game === 'reaction' ? sql`asc` : sql`desc`;
	const result = await getDatabase().execute(sql`
		with personal_bests as (
			select r.user_id as "userId", u.nickname, u.house,
				${aggregate}::integer as score
			from ${gameRecords} r join ${users} u on u.id = r.user_id
			where r.game = ${game} and u.deleted_at is null
				${week ? sql`and r.week = ${week}::date` : sql``}
			group by r.user_id, u.nickname, u.house
		), ranked as (
			select *, rank() over (order by score ${direction})::integer as rank,
				count(*) over ()::integer as participants,
				row_number() over (order by score ${direction}, "userId") as position
			from personal_bests
		)
		select "userId", nickname, house, score, rank, participants from ranked
		where position <= 10 or "userId" = ${userId}::uuid
		order by position
	`);
	const rows = result.rows as unknown as GameStanding[];
	return {
		entries: rows.slice(0, 10),
		personal: rows.find((row) => row.userId === userId) ?? null,
		participants: rows[0]?.participants ?? 0
	};
}
