import { sql } from 'drizzle-orm';
import {
	bigint,
	bigserial,
	boolean,
	check,
	customType,
	date,
	doublePrecision,
	index,
	integer,
	jsonb,
	numeric,
	pgSchema,
	primaryKey,
	text,
	unique,
	uniqueIndex,
	uuid
} from 'drizzle-orm/pg-core';

import type { GraduationPolicyRules } from '$lib/types/degree.type.js';

export const appSchema = pgSchema('app');
export const identitySchema = pgSchema('private');
export const communitySchema = pgSchema('community');
export const academicSchema = pgSchema('academic');
export const pointsSchema = pgSchema('points');

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
		nickname: text().notNull(),
		group: text().notNull().default('user'),
		blockedUntil: isoTimestamp('blocked_until'),
		deletedAt: isoTimestamp('deleted_at'),
		...timestamps
	},
	(table) => [
		unique('users_nickname_unique').on(table.nickname),
		check(
			'users_group_check',
			sql`${table.group} in ('guest', 'user', 'moderator', 'manager', 'dev')`
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

export const courses = academicSchema.table(
	'courses',
	{
		id: text().primaryKey(),
		name: text().notNull(),
		category: text(),
		subcategory: text(),
		level: integer(),
		credits: numeric({ precision: 4, scale: 1 }).notNull(),
		creditType: text('credit_type').notNull().default('numeric'),
		gradExcluded: boolean('grad_excluded').notNull().default(false),
		...timestamps
	},
	(table) => [
		check('courses_credits_check', sql`${table.credits} >= 0`),
		check('courses_credit_type_check', sql`${table.creditType} in ('numeric', 'pass')`)
	]
);

export const professors = academicSchema.table('professors', {
	id: uuid().defaultRandom().primaryKey(),
	name: text().notNull().unique()
});

export const courseOfferings = academicSchema.table(
	'course_offerings',
	{
		id: uuid().defaultRandom().primaryKey(),
		courseId: text('course_id')
			.notNull()
			.references(() => courses.id),
		year: integer().notNull(),
		term: integer().notNull(),
		section: text().notNull().default('01'),
		subtitle: text(),
		capacity: integer(),
		archivedAt: isoTimestamp('archived_at'),
		...timestamps
	},
	(table) => [
		unique('course_offerings_term_course_section_unique').on(
			table.year,
			table.term,
			table.courseId,
			table.section
		),
		index('course_offerings_term_idx').on(table.year, table.term),
		check('course_offerings_term_check', sql`${table.term} between 1 and 4`),
		check(
			'course_offerings_capacity_check',
			sql`${table.capacity} is null or ${table.capacity} >= 0`
		)
	]
);

export const courseOfferingProfessors = academicSchema.table(
	'course_offering_professors',
	{
		offeringId: uuid('offering_id')
			.notNull()
			.references(() => courseOfferings.id, { onDelete: 'cascade' }),
		professorId: uuid('professor_id')
			.notNull()
			.references(() => professors.id),
		position: integer().notNull()
	},
	(table) => [
		primaryKey({ columns: [table.offeringId, table.professorId] }),
		unique('course_offering_professors_position_unique').on(table.offeringId, table.position),
		index('course_offering_professors_professor_idx').on(table.professorId),
		check('course_offering_professors_position_check', sql`${table.position} >= 0`)
	]
);

export const courseMeetings = academicSchema.table(
	'course_meetings',
	{
		id: uuid().defaultRandom().primaryKey(),
		offeringId: uuid('offering_id')
			.notNull()
			.references(() => courseOfferings.id, { onDelete: 'cascade' }),
		weekday: integer().notNull(),
		startsAt: integer('starts_at').notNull(),
		endsAt: integer('ends_at').notNull(),
		room: text()
	},
	(table) => [
		index('course_meetings_offering_idx').on(table.offeringId),
		check('course_meetings_weekday_check', sql`${table.weekday} between 1 and 7`),
		check(
			'course_meetings_time_check',
			sql`${table.startsAt} >= 0 and ${table.endsAt} <= 1440 and ${table.startsAt} < ${table.endsAt}`
		)
	]
);

export const posts = communitySchema.table(
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

export const petitions = communitySchema.table(
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

export const petitionSignatures = communitySchema.table(
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

export const studentAcademicProfiles = academicSchema.table(
	'student_academic_profiles',
	{
		userId: uuid('user_id')
			.primaryKey()
			.references(() => users.id, { onDelete: 'cascade' }),
		admissionYear: integer('admission_year').notNull(),
		espWaivedCourseIds: jsonb('esp_waived_course_ids')
			.$type<string[]>()
			.notNull()
			.default(sql`'[]'::jsonb`),
		...timestamps
	},
	(table) => [
		check(
			'student_academic_profiles_admission_year_check',
			sql`${table.admissionYear} between 2022 and 2100`
		),
		check(
			'student_academic_profiles_esp_waived_courses_check',
			sql`jsonb_typeof(${table.espWaivedCourseIds}) = 'array'`
		)
	]
);

export const graduationPolicies = academicSchema.table(
	'graduation_policies',
	{
		id: uuid().defaultRandom().primaryKey(),
		name: text().notNull(),
		admissionYearFrom: integer('admission_year_from').notNull(),
		admissionYearTo: integer('admission_year_to').notNull(),
		rules: jsonb().$type<GraduationPolicyRules>().notNull(),
		...timestamps
	},
	(table) => [
		unique('graduation_policies_year_range_unique').on(
			table.admissionYearFrom,
			table.admissionYearTo
		),
		check(
			'graduation_policies_year_range_check',
			sql`${table.admissionYearFrom} <= ${table.admissionYearTo}`
		)
	]
);

export const courseCompletions = academicSchema.table(
	'course_completions',
	{
		id: uuid().defaultRandom().primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		courseId: text('course_id').references(() => courses.id),
		offeringId: uuid('offering_id').references(() => courseOfferings.id),
		year: integer().notNull(),
		term: integer().notNull(),
		credits: numeric({ precision: 4, scale: 1 }).notNull(),
		grade: text(),
		status: text().notNull().default('passed'),
		source: text().notNull().default('manual'),
		...timestamps
	},
	(table) => [
		unique('course_completions_user_course_term_unique').on(
			table.userId,
			table.courseId,
			table.year,
			table.term
		),
		unique('course_completions_user_offering_unique').on(table.userId, table.offeringId),
		index('course_completions_user_idx').on(table.userId),
		check(
			'course_completions_reference_check',
			sql`num_nonnulls(${table.courseId}, ${table.offeringId}) = 1`
		),
		check('course_completions_term_check', sql`${table.term} between 1 and 4`),
		check('course_completions_credits_check', sql`${table.credits} >= 0`),
		check(
			'course_completions_status_check',
			sql`${table.status} in ('passed', 'failed', 'withdrawn')`
		),
		check('course_completions_source_check', sql`${table.source} in ('manual', 'portal', 'admin')`)
	]
);

export const timetables = academicSchema.table(
	'timetables',
	{
		id: uuid().defaultRandom().primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		year: integer().notNull(),
		term: integer().notNull(),
		name: text().notNull(),
		position: integer().notNull(),
		isConfirmed: boolean('is_confirmed').notNull().default(false),
		...timestamps
	},
	(table) => [
		unique('timetables_user_term_position_unique').on(
			table.userId,
			table.year,
			table.term,
			table.position
		),
		unique('timetables_user_term_name_unique').on(table.userId, table.year, table.term, table.name),
		uniqueIndex('timetables_one_confirmed_per_term_unique')
			.on(table.userId, table.year, table.term)
			.where(sql`${table.isConfirmed} = true`),
		index('timetables_confirmed_term_idx')
			.on(table.year, table.term)
			.where(sql`${table.isConfirmed} = true`),
		check('timetables_term_check', sql`${table.term} between 1 and 4`),
		check('timetables_position_check', sql`${table.position} >= 0`)
	]
);

export const timetableItems = academicSchema.table(
	'timetable_items',
	{
		timetableId: uuid('timetable_id')
			.notNull()
			.references(() => timetables.id, { onDelete: 'cascade' }),
		offeringId: uuid('offering_id')
			.notNull()
			.references(() => courseOfferings.id),
		createdAt: isoTimestamp('created_at')
			.default(sql`now()`)
			.notNull()
	},
	(table) => [
		primaryKey({ columns: [table.timetableId, table.offeringId] }),
		index('timetable_items_offering_idx').on(table.offeringId, table.timetableId)
	]
);

export const reviews = academicSchema.table(
	'reviews',
	{
		id: uuid().defaultRandom().primaryKey(),
		offeringId: uuid('offering_id')
			.notNull()
			.references(() => courseOfferings.id),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
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
		uniqueIndex('reviews_user_offering_unique').on(table.userId, table.offeringId),
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

export const petitionFiles = communitySchema.table(
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
	userProfiles,
	userIdentities,
	courses,
	professors,
	courseOfferings,
	courseOfferingProfessors,
	courseMeetings,
	studentAcademicProfiles,
	graduationPolicies,
	courseCompletions,
	timetables,
	timetableItems,
	posts,
	postLikes,
	comments,
	petitions,
	petitionSignatures,
	reviews,
	fileMetas,
	postFiles,
	petitionFiles,
	pointAccounts,
	pointLedgerEntries,
	pointDailyEventCounts,
	throttles,
	pushSubscriptions,
	activityLogs
].forEach((table) => table.enableRLS());
