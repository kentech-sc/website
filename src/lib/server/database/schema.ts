import { sql } from 'drizzle-orm';
import {
	bigint,
	bigserial,
	check,
	customType,
	date,
	doublePrecision,
	index,
	integer,
	jsonb,
	pgSchema,
	primaryKey,
	text,
	unique,
	uuid
} from 'drizzle-orm/pg-core';

export const appSchema = pgSchema('app');
export const identitySchema = pgSchema('private');

const isoTimestamp = customType<{ data: string; driverData: string }>({
	dataType: () => 'timestamp with time zone',
	fromDriver: (value) => new Date(value).toISOString(),
	toDriver: (value) => value
});

const timestamps = {
	createdAt: isoTimestamp('created_at')
		.default(sql`now()`)
		.notNull(),
	updatedAt: isoTimestamp('updated_at')
		.default(sql`now()`)
		.notNull()
};

export const users = appSchema.table(
	'users',
	{
		id: uuid().defaultRandom().primaryKey(),
		email: text().notNull(),
		realName: text('real_name').notNull(),
		nickname: text().notNull(),
		group: text().notNull().default('user'),
		blockedUntil: isoTimestamp('blocked_until'),
		deletedAt: isoTimestamp('deleted_at'),
		points: integer().notNull().default(0),
		...timestamps
	},
	(table) => [
		unique('users_nickname_unique').on(table.nickname),
		index('users_email_idx').on(table.email),
		check(
			'users_group_check',
			sql`${table.group} in ('guest', 'user', 'moderator', 'manager', 'dev')`
		)
	]
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

export const courses = appSchema.table('courses', {
	id: text().primaryKey(),
	name: text().notNull(),
	content: text().notNull()
});

export const professors = appSchema.table('professors', {
	id: uuid().defaultRandom().primaryKey(),
	name: text().notNull().unique()
});

export const posts = appSchema.table(
	'posts',
	{
		id: uuid().defaultRandom().primaryKey(),
		boardId: text('board_id').notNull(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		displayType: text('display_type').notNull(),
		title: text().notNull(),
		content: text().notNull(),
		viewCnt: integer('view_count').notNull().default(0),
		commentCnt: integer('comment_count').notNull().default(0),
		...timestamps
	},
	(table) => [
		index('posts_board_created_idx').on(table.boardId, table.createdAt),
		check('posts_board_check', sql`${table.boardId} in ('notice', 'free', 'bylaw')`),
		check(
			'posts_display_type_check',
			sql`${table.displayType} in ('email', 'realName', 'nickname', 'anonymous')`
		),
		check('posts_view_count_check', sql`${table.viewCnt} >= 0`),
		check('posts_comment_count_check', sql`${table.commentCnt} >= 0`)
	]
);

export const postLikes = appSchema.table(
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

export const comments = appSchema.table(
	'comments',
	{
		id: uuid().defaultRandom().primaryKey(),
		postId: uuid('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		displayType: text('display_type').notNull(),
		content: text().notNull(),
		...timestamps
	},
	(table) => [
		index('comments_post_created_idx').on(table.postId, table.createdAt),
		check(
			'comments_display_type_check',
			sql`${table.displayType} in ('email', 'realName', 'nickname', 'anonymous')`
		)
	]
);

export const petitions = appSchema.table(
	'petitions',
	{
		id: uuid().defaultRandom().primaryKey(),
		title: text().notNull(),
		content: text().notNull(),
		status: text().notNull().default('ongoing'),
		viewCnt: integer('view_count').notNull().default(0),
		petitionerId: uuid('petitioner_id')
			.notNull()
			.references(() => users.id),
		responderId: uuid('responder_id').references(() => users.id),
		response: text(),
		answeredAt: isoTimestamp('answered_at'),
		...timestamps
	},
	(table) => [
		index('petitions_created_idx').on(table.createdAt),
		check(
			'petitions_status_check',
			sql`${table.status} in ('ongoing', 'pending', 'reviewing', 'answered', 'expired')`
		),
		check('petitions_view_count_check', sql`${table.viewCnt} >= 0`)
	]
);

export const petitionSignatures = appSchema.table(
	'petition_signatures',
	{
		petitionId: uuid('petition_id')
			.notNull()
			.references(() => petitions.id, { onDelete: 'cascade' }),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		createdAt: isoTimestamp('created_at')
			.default(sql`now()`)
			.notNull()
	},
	(table) => [primaryKey({ columns: [table.petitionId, table.userId] })]
);

export const reviews = appSchema.table(
	'reviews',
	{
		id: uuid().defaultRandom().primaryKey(),
		courseId: text('course_id')
			.notNull()
			.references(() => courses.id),
		professorId: uuid('professor_id')
			.notNull()
			.references(() => professors.id),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		year: integer().notNull(),
		term: integer().notNull(),
		title: text().notNull(),
		assignmentScore: doublePrecision('assignment_score').notNull(),
		lectureScore: doublePrecision('lecture_score').notNull(),
		examScore: doublePrecision('exam_score').notNull(),
		satisfactionScore: doublePrecision('satisfaction_score').notNull(),
		comment: text().notNull().default(''),
		...timestamps
	},
	(table) => [
		index('reviews_created_idx').on(table.createdAt),
		check('reviews_term_check', sql`${table.term} between 1 and 4`),
		check(
			'reviews_scores_check',
			sql`${table.assignmentScore} between 1 and 5
				and ${table.lectureScore} between 1 and 5
				and ${table.examScore} between 1 and 5
				and ${table.satisfactionScore} between 1 and 10`
		)
	]
);

export const fileMetas = appSchema.table('file_metas', {
	id: uuid().defaultRandom().primaryKey(),
	key: text().notNull().unique(),
	name: text().notNull(),
	size: bigint({ mode: 'number' }).notNull(),
	mime: text().notNull(),
	ext: text().notNull(),
	...timestamps
});

export const postFiles = appSchema.table(
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

export const petitionFiles = appSchema.table(
	'petition_files',
	{
		petitionId: uuid('petition_id')
			.notNull()
			.references(() => petitions.id, { onDelete: 'cascade' }),
		fileId: uuid('file_id')
			.notNull()
			.references(() => fileMetas.id, { onDelete: 'cascade' })
	},
	(table) => [primaryKey({ columns: [table.petitionId, table.fileId] })]
);

export const pointStates = appSchema.table(
	'point_states',
	{
		id: uuid().defaultRandom().primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.unique()
			.references(() => users.id, { onDelete: 'cascade' }),
		dateKey: date('date_key', { mode: 'string' }).notNull(),
		postCount: integer('post_count').notNull().default(0),
		commentCount: integer('comment_count').notNull().default(0),
		reviewCount: integer('review_count').notNull().default(0),
		petitionCount: integer('petition_count').notNull().default(0),
		...timestamps
	},
	(table) => [
		check(
			'point_states_counts_check',
			sql`${table.postCount} >= 0 and ${table.commentCount} >= 0
				and ${table.reviewCount} >= 0 and ${table.petitionCount} >= 0`
		)
	]
);

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

// Server-side authorization remains the source of truth. RLS is enabled as a
// deny-by-default guard if either schema is ever exposed through a data API.
[
	users,
	userIdentities,
	courses,
	professors,
	posts,
	postLikes,
	comments,
	petitions,
	petitionSignatures,
	reviews,
	fileMetas,
	postFiles,
	petitionFiles,
	pointStates,
	throttles,
	pushSubscriptions,
	activityLogs
].forEach((table) => table.enableRLS());
