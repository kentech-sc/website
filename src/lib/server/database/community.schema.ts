import { sql } from 'drizzle-orm';
import { check, index, integer, primaryKey, text, uuid } from 'drizzle-orm/pg-core';

import { fileMetas } from './app.schema.js';
import { communitySchema, isoTimestamp, timestamps } from './schema-core.js';
import { users } from './user.schema.js';

export const posts = communitySchema.table(
	'posts',
	{
		id: uuid().defaultRandom().primaryKey(),
		boardId: text('board_id').notNull(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		authorNameMode: text('display_type').notNull(),
		title: text().notNull(),
		content: text().notNull(),
		viewCount: integer('view_count').notNull().default(0),
		commentCount: integer('comment_count').notNull().default(0),
		...timestamps
	},
	(table) => [
		index('posts_board_created_idx').on(table.boardId, table.createdAt),
		check('posts_board_check', sql`${table.boardId} in ('notice', 'free', 'bylaw')`),
		check(
			'posts_display_type_check',
			sql`${table.authorNameMode} in ('email', 'realName', 'nickname', 'anonymous')`
		),
		check('posts_view_count_check', sql`${table.viewCount} >= 0`),
		check('posts_comment_count_check', sql`${table.commentCount} >= 0`)
	]
);

export const postLikes = communitySchema.table(
	'post_likes',
	{
		postId: uuid('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		createdAt: isoTimestamp('created_at')
			.default(sql`now()`)
			.notNull()
	},
	(table) => [primaryKey({ columns: [table.postId, table.userId] })]
);

export const comments = communitySchema.table(
	'comments',
	{
		id: uuid().defaultRandom().primaryKey(),
		postId: uuid('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		authorNameMode: text('display_type').notNull(),
		content: text().notNull(),
		...timestamps
	},
	(table) => [
		index('comments_post_created_idx').on(table.postId, table.createdAt),
		check(
			'comments_display_type_check',
			sql`${table.authorNameMode} in ('email', 'realName', 'nickname', 'anonymous')`
		)
	]
);

export const submissions = communitySchema.table(
	'submissions',
	{
		id: uuid().defaultRandom().primaryKey(),
		kind: text().notNull().default('petition'),
		category: text(),
		authorNameMode: text('display_type').notNull().default('realName'),
		title: text().notNull(),
		content: text().notNull(),
		status: text().notNull().default('ongoing'),
		viewCount: integer('view_count').notNull().default(0),
		authorId: uuid('author_id')
			.notNull()
			.references(() => users.id),
		responderId: uuid('responder_id').references(() => users.id),
		response: text(),
		answeredAt: isoTimestamp('answered_at'),
		...timestamps
	},
	(table) => [
		index('submissions_kind_created_idx').on(table.kind, table.createdAt),
		check('submissions_kind_check', sql`${table.kind} in ('petition', 'feedback')`),
		check(
			'submissions_category_check',
			sql`(${table.kind} = 'petition' and ${table.category} is null) or (${table.kind} = 'feedback' and ${table.category} is not null and ${table.category} in ('executive', 'education', 'clubs', 'audit', 'election', 'website', 'other'))`
		),
		check(
			'submissions_display_type_check',
			sql`${table.authorNameMode} in ('realName', 'nickname', 'anonymous') and (${table.kind} <> 'petition' or ${table.authorNameMode} = 'realName')`
		),
		check(
			'submissions_status_check',
			sql`${table.status} in ('ongoing', 'pending', 'reviewing', 'answered', 'expired')`
		),
		check('submissions_view_count_check', sql`${table.viewCount} >= 0`)
	]
);

// Legacy reports are retained after switching intake to Google Forms.
// Keep this schema to avoid generating a destructive table-drop migration.
export const anonymousReports = communitySchema.table(
	'audit_reports',
	{
		id: uuid().defaultRandom().primaryKey(),
		title: text().notNull(),
		content: text().notNull(),
		status: text().notNull().default('received'),
		...timestamps
	},
	(table) => [
		index('audit_reports_status_created_idx').on(table.status, table.createdAt),
		check('audit_reports_status_check', sql`${table.status} in ('received', 'reviewing', 'closed')`)
	]
);

export const submissionSupports = communitySchema.table(
	'submission_supports',
	{
		submissionId: uuid('submission_id')
			.notNull()
			.references(() => submissions.id, { onDelete: 'cascade' }),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		createdAt: isoTimestamp('created_at')
			.default(sql`now()`)
			.notNull()
	},
	(table) => [primaryKey({ columns: [table.submissionId, table.userId] })]
);

export const postFiles = communitySchema.table(
	'post_files',
	{
		postId: uuid('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		fileId: uuid('file_id')
			.notNull()
			.references(() => fileMetas.id, { onDelete: 'cascade' })
	},
	(table) => [primaryKey({ columns: [table.postId, table.fileId] })]
);

export const submissionFiles = communitySchema.table(
	'submission_files',
	{
		submissionId: uuid('submission_id')
			.notNull()
			.references(() => submissions.id, { onDelete: 'cascade' }),
		fileId: uuid('file_id')
			.notNull()
			.references(() => fileMetas.id, { onDelete: 'cascade' })
	},
	(table) => [primaryKey({ columns: [table.submissionId, table.fileId] })]
);
