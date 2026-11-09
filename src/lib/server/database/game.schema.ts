import { sql } from 'drizzle-orm';
import { check, date, index, integer, jsonb, text, unique, uuid } from 'drizzle-orm/pg-core';

import { appSchema, isoTimestamp } from './schema-core.js';
import { users } from './user.schema.js';

import type { GameId, GameRunState } from '$lib/types/game.type.js';

export const gameSessions = appSchema.table(
	'game_sessions',
	{
		id: uuid().defaultRandom().primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		game: text().$type<GameId>().notNull(),
		seed: integer().notNull(),
		// The existing column holds round state for all games.
		roundState: jsonb('reaction_state').$type<GameRunState>(),
		startedAt: isoTimestamp('started_at')
			.notNull()
			.default(sql`now()`),
		completedAt: isoTimestamp('completed_at'),
		completedScore: integer('completed_score')
	},
	(table) => [
		unique('game_sessions_user_game_unique').on(table.userId, table.game),
		check('game_sessions_game_check', sql`${table.game} in ('reaction', 'color', 'recycling')`)
	]
);

export const gameRecords = appSchema.table(
	'game_records',
	{
		id: uuid().defaultRandom().primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		game: text().$type<GameId>().notNull(),
		week: date({ mode: 'string' }).notNull(),
		score: integer().notNull(),
		achievedAt: isoTimestamp('achieved_at')
			.notNull()
			.default(sql`now()`)
	},
	(table) => [
		unique('game_records_user_game_week_unique').on(table.userId, table.game, table.week),
		index('game_records_game_week_score_idx').on(table.game, table.week, table.score),
		check('game_records_game_check', sql`${table.game} in ('reaction', 'color', 'recycling')`),
		check(
			'game_records_score_check',
			sql`(${table.game} = 'reaction' and ${table.score} between 0 and 2000) or (${table.game} in ('color', 'recycling') and ${table.score} between 1 and 200)`
		)
	]
);
