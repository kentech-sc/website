import { sql } from 'drizzle-orm';
import {
	boolean,
	check,
	doublePrecision,
	index,
	integer,
	jsonb,
	numeric,
	primaryKey,
	text,
	unique,
	uniqueIndex,
	uuid
} from 'drizzle-orm/pg-core';

import { academicSchema, isoTimestamp, timestamps } from './schema-core.js';
import { users } from './user.schema.js';

import type { GraduationPolicyRules } from '$lib/types/degree.type.js';

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
		excludedFromGraduation: boolean('grad_excluded').notNull().default(false),
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
		academicCareer: text('academic_career').notNull().default('undergraduate'),
		section: text().notNull().default('01'),
		subtitle: text(),
		capacity: integer(),
		archivedAt: isoTimestamp('archived_at'),
		...timestamps
	},
	(table) => [
		unique('course_offerings_term_career_course_section_unique').on(
			table.year,
			table.term,
			table.academicCareer,
			table.courseId,
			table.section
		),
		index('course_offerings_term_idx').on(table.year, table.term),
		check('course_offerings_term_check', sql`${table.term} between 1 and 4`),
		check(
			'course_offerings_academic_career_check',
			sql`${table.academicCareer} in ('undergraduate', 'graduate')`
		),
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
		startMinute: integer('starts_at').notNull(),
		endMinute: integer('ends_at').notNull(),
		room: text()
	},
	(table) => [
		index('course_meetings_offering_idx').on(table.offeringId),
		check('course_meetings_weekday_check', sql`${table.weekday} between 1 and 7`),
		check(
			'course_meetings_time_check',
			sql`${table.startMinute} >= 0 and ${table.endMinute} <= 1440 and ${table.startMinute} < ${table.endMinute}`
		)
	]
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
		hideGrades: boolean('hide_grades').notNull().default(false),
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

export const courseRecords = academicSchema.table(
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
			.notNull(),
		changeReason: text('change_reason')
	},
	(table) => [
		primaryKey({ columns: [table.timetableId, table.offeringId] }),
		index('timetable_items_offering_idx').on(table.offeringId, table.timetableId),
		check(
			'timetable_items_change_reason_check',
			sql`${table.changeReason} is null or ${table.changeReason} in ('schedule_changed', 'cancelled', 'details_changed')`
		)
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
