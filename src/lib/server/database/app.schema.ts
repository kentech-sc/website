import { sql } from 'drizzle-orm';
import {
	bigint,
	bigserial,
	boolean,
	check,
	index,
	integer,
	jsonb,
	text,
	unique,
	uuid
} from 'drizzle-orm/pg-core';

import { appSchema, isoTimestamp, timestamps } from './schema-core.js';
import { users } from './user.schema.js';

export const fileMetas = appSchema.table('file_metas', {
	id: uuid().defaultRandom().primaryKey(),
	key: text().notNull().unique(),
	name: text().notNull(),
	size: bigint({ mode: 'number' }).notNull(),
	mime: text().notNull(),
	ext: text().notNull(),
	...timestamps
});

/**
 * 메인 화면 배너 보관함. 여러 개를 올려두고 그중 하나만 활성으로 건다.
 * (파일 정리 cron 이 참조 없는 파일을 지우므로 file_metas 를 여기서 붙잡아 둔다)
 */
export const banners = appSchema.table('banners', {
	id: uuid().defaultRandom().primaryKey(),
	fileId: uuid('file_id')
		.notNull()
		.references(() => fileMetas.id),
	linkUrl: text('link_url'),
	/** 슬라이드에 나오는지. 여러 개가 동시에 켜질 수 있다. */
	isActive: boolean('is_active').notNull().default(false),
	/** 슬라이드 순서. 작을수록 먼저 나온다. */
	position: integer().notNull().default(0),
	...timestamps
});

export const throttles = appSchema.table(
	'throttles',
	{
		id: uuid().defaultRandom().primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		bucket: text().notNull(),
		availableAt: isoTimestamp('available_at').notNull(),
		...timestamps
	},
	(table) => [
		unique('throttles_user_bucket_unique').on(table.userId, table.bucket),
		check('throttles_bucket_check', sql`${table.bucket} in ('article', 'comment', 'upload')`)
	]
);

export const pushSubscriptions = appSchema.table(
	'push_subscriptions',
	{
		id: uuid().defaultRandom().primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		endpoint: text().notNull(),
		expirationTime: bigint('expiration_time', { mode: 'number' }),
		p256dh: text().notNull(),
		auth: text().notNull(),
		userAgent: text('user_agent').notNull().default(''),
		diningBreakfast: boolean('dining_breakfast').notNull().default(true),
		diningLunch: boolean('dining_lunch').notNull().default(true),
		diningDinner: boolean('dining_dinner').notNull().default(true),
		...timestamps
	},
	(table) => [
		unique('push_subscriptions_user_endpoint_unique').on(table.userId, table.endpoint),
		index('push_subscriptions_endpoint_idx').on(table.endpoint)
	]
);

export const activityLogs = appSchema.table('activity_logs', {
	id: bigserial({ mode: 'number' }).primaryKey(),
	actorId: uuid('actor_id').notNull(),
	action: text().notNull(),
	targetType: text('target_type').notNull(),
	targetId: text('target_id').notNull(),
	cause: text().notNull(),
	beforeSnapshot: jsonb('before_snapshot'),
	afterSnapshot: jsonb('after_snapshot'),
	createdAt: isoTimestamp('created_at')
		.default(sql`now()`)
		.notNull()
});
