import { sql } from 'drizzle-orm';
import {
	check,
	date,
	index,
	integer,
	jsonb,
	primaryKey,
	text,
	unique,
	uuid
} from 'drizzle-orm/pg-core';

import { isoTimestamp, pointsSchema, timestamps } from './schema-core.js';
import { users } from './user.schema.js';

export const pointAccounts = pointsSchema.table(
	'accounts',
	{
		userId: uuid('user_id')
			.primaryKey()
			.references(() => users.id, { onDelete: 'cascade' }),
		balance: integer().notNull().default(0),
		lifetimeEarned: integer('lifetime_earned').notNull().default(0),
		lifetimeSpent: integer('lifetime_spent').notNull().default(0),
		...timestamps
	},
	(table) => [
		check('point_accounts_lifetime_earned_check', sql`${table.lifetimeEarned} >= 0`),
		check('point_accounts_lifetime_spent_check', sql`${table.lifetimeSpent} >= 0`)
	]
);

export const pointLedgerEntries = pointsSchema.table(
	'ledger_entries',
	{
		id: uuid().defaultRandom().primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		eventType: text('event_type').notNull(),
		amount: integer().notNull(),
		sourceType: text('source_type'),
		sourceId: text('source_id'),
		idempotencyKey: text('idempotency_key'),
		metadata: jsonb().$type<Record<string, unknown>>().notNull().default({}),
		createdAt: isoTimestamp('created_at')
			.default(sql`now()`)
			.notNull()
	},
	(table) => [
		unique('point_ledger_entries_idempotency_key_unique').on(table.idempotencyKey),
		index('point_ledger_entries_user_created_idx').on(table.userId, table.createdAt),
		index('point_ledger_entries_event_type_idx').on(table.eventType),
		check('point_ledger_entries_amount_check', sql`${table.amount} <> 0`)
	]
);

export const pointDailyEventCounts = pointsSchema.table(
	'daily_event_counts',
	{
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		dateKey: date('date_key', { mode: 'string' }).notNull(),
		eventType: text('event_type').notNull(),
		count: integer().notNull().default(0),
		...timestamps
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.dateKey, table.eventType] }),
		check('point_daily_event_counts_count_check', sql`${table.count} >= 0`)
	]
);
