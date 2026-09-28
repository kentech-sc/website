import { sql } from 'drizzle-orm';
import { check, index, text, unique, uuid } from 'drizzle-orm/pg-core';

import { appSchema, identitySchema, isoTimestamp, timestamps } from './schema-core.js';

export const users = appSchema.table(
	'users',
	{
		id: uuid().defaultRandom().primaryKey(),
		nickname: text().notNull(),
		gender: text().$type<'male' | 'female'>(),
		house: text().$type<'tesla' | 'edison'>(),
		group: text().notNull().default('user'),
		blockedUntil: isoTimestamp('blocked_until'),
		deletedAt: isoTimestamp('deleted_at'),
		...timestamps
	},
	(table) => [
		unique('users_nickname_unique').on(table.nickname),
		check('users_gender_check', sql`${table.gender} in ('male', 'female')`),
		check('users_house_check', sql`${table.house} in ('tesla', 'edison')`),
		check(
			'users_group_check',
			sql`${table.group} in ('guest', 'user', 'moderator', 'manager', 'auditor', 'dev')`
		)
	]
);

export const userProfiles = identitySchema.table(
	'user_profiles',
	{
		userId: uuid('user_id')
			.primaryKey()
			.references(() => users.id, { onDelete: 'cascade' }),
		email: text().notNull(),
		realName: text('real_name').notNull(),
		...timestamps
	},
	(table) => [index('user_profiles_email_idx').on(table.email)]
);

export const userIdentities = identitySchema.table(
	'user_identities',
	{
		id: uuid().defaultRandom().primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		issuer: text().notNull(),
		subject: text().notNull(),
		emailAtLogin: text('email_at_login').notNull(),
		...timestamps
	},
	(table) => [
		unique('user_identities_issuer_subject_unique').on(table.issuer, table.subject),
		index('user_identities_user_id_idx').on(table.userId)
	]
);
