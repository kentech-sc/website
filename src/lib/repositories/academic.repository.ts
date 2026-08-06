import { and, asc, desc, eq, gte, inArray, isNull, lte, sql } from 'drizzle-orm';

import type {
	CourseCompletion,
	CourseCompletionView,
	Offering,
	OfferingCreditType,
	OfferingImportInput,
	StudentAcademicProfile
} from '$lib/types/academic.type.js';
import type { DegreeCourseInput, GraduationPolicy } from '$lib/types/degree.type.js';
import type { UserId } from '$lib/types/user.type.js';

import {
	courseCompletions,
	courseMeetings,
	courseOfferingProfessors,
	courseOfferings,
	courses,
	graduationPolicies,
	professors,
	studentAcademicProfiles,
	timetables
} from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';

export async function findOfferings(year: number, term: number): Promise<Offering[]> {
	const rows = await getDatabase()
		.select({ id: courseOfferings.id })
		.from(courseOfferings)
		.innerJoin(courses, eq(courseOfferings.courseId, courses.id))
		.where(
			and(
				eq(courseOfferings.year, year),
				eq(courseOfferings.term, term),
				isNull(courseOfferings.archivedAt)
			)
		)
		.orderBy(asc(courses.id), asc(courseOfferings.section));
	const offeringMap = await findOfferingMapByIds(rows.map(({ id }) => id));
	return rows.flatMap(({ id }) => {
		const offering = offeringMap.get(id);
		return offering ? [offering] : [];
	});
}

export async function findOfferingsIncludingArchived(
	year: number,
	term: number
): Promise<Offering[]> {
	const rows = await getDatabase()
		.select({ id: courseOfferings.id })
		.from(courseOfferings)
		.where(and(eq(courseOfferings.year, year), eq(courseOfferings.term, term)))
		.orderBy(asc(courseOfferings.courseId), asc(courseOfferings.section));
	const offeringMap = await findOfferingMapByIds(rows.map(({ id }) => id));
	return rows.flatMap(({ id }) => {
		const offering = offeringMap.get(id);
		return offering ? [offering] : [];
	});
}

export async function findOffering(id: string): Promise<Offering | null> {
	return (await findOfferingMapByIds([id])).get(id) ?? null;
}

export async function findOfferingMapByIds(ids: string[]): Promise<Map<string, Offering>> {
	const uniqueIds = [...new Set(ids)];
	if (!uniqueIds.length) return new Map();
	const rows = await getDatabase()
		.select({
			offering: courseOfferings,
			courseName: courses.name,
			credits: courses.credits,
			creditType: courses.creditType,
			category: courses.category,
			subcategory: courses.subcategory,
			level: courses.level,
			gradExcluded: courses.gradExcluded
		})
		.from(courseOfferings)
		.innerJoin(courses, eq(courseOfferings.courseId, courses.id))
		.where(inArray(courseOfferings.id, uniqueIds));
	const [meetings, professorRows] = await Promise.all([
		getDatabase()
			.select()
			.from(courseMeetings)
			.where(inArray(courseMeetings.offeringId, uniqueIds)),
		getDatabase()
			.select({
				offeringId: courseOfferingProfessors.offeringId,
				id: professors.id,
				name: professors.name
			})
			.from(courseOfferingProfessors)
			.innerJoin(professors, eq(courseOfferingProfessors.professorId, professors.id))
			.where(inArray(courseOfferingProfessors.offeringId, uniqueIds))
			.orderBy(asc(courseOfferingProfessors.position))
	]);
	const professorsByOffering = new Map<string, Array<{ id: string; name: string }>>();
	for (const { offeringId, id, name } of professorRows)
		professorsByOffering.set(offeringId, [
			...(professorsByOffering.get(offeringId) ?? []),
			{ id, name }
		]);
	const meetingsByOffering = new Map<string, typeof meetings>();
	for (const meeting of meetings)
		meetingsByOffering.set(meeting.offeringId, [
			...(meetingsByOffering.get(meeting.offeringId) ?? []),
			meeting
		]);
	return new Map(
		rows.map(
			({
				offering,
				courseName,
				credits,
				creditType,
				category,
				subcategory,
				level,
				gradExcluded
			}) => [
				offering.id,
				{
					...offering,
					credits: Number(credits),
					creditType: creditType as OfferingCreditType,
					courseName,
					category,
					subcategory,
					level,
					gradExcluded,
					professors: professorsByOffering.get(offering.id) ?? [],
					meetings: meetingsByOffering.get(offering.id) ?? []
				}
			]
		)
	);
}

export async function findAllOfferings(): Promise<Offering[]> {
	const rows = await getDatabase()
		.select({ id: courseOfferings.id })
		.from(courseOfferings)
		.where(isNull(courseOfferings.archivedAt))
		.orderBy(
			desc(courseOfferings.year),
			desc(courseOfferings.term),
			asc(courseOfferings.courseId),
			asc(courseOfferings.section)
		);
	const offeringMap = await findOfferingMapByIds(rows.map(({ id }) => id));
	return rows.flatMap(({ id }) => {
		const offering = offeringMap.get(id);
		return offering ? [offering] : [];
	});
}

/** 한 번이라도 개설된 적 있는 강의 코드만 골라낸다. (보관된 개설도 포함) */
export async function findOfferedCourseIds(courseIds: string[]): Promise<Set<string>> {
	const uniqueIds = [...new Set(courseIds)];
	if (!uniqueIds.length) return new Set();
	const rows = await getDatabase()
		.select({ courseId: courseOfferings.courseId })
		.from(courseOfferings)
		.where(inArray(courseOfferings.courseId, uniqueIds));
	return new Set(rows.map((row) => row.courseId));
}

export async function findGraduationPolicy(
	admissionYear: number
): Promise<GraduationPolicy | null> {
	const rows = await getDatabase()
		.select()
		.from(graduationPolicies)
		.where(
			and(
				lte(graduationPolicies.admissionYearFrom, admissionYear),
				gte(graduationPolicies.admissionYearTo, admissionYear)
			)
		)
		.orderBy(asc(graduationPolicies.admissionYearFrom))
		.limit(1);
	return rows[0] ?? null;
}

export async function findAcademicProfile(userId: UserId): Promise<StudentAcademicProfile | null> {
	const rows = await getDatabase()
		.select()
		.from(studentAcademicProfiles)
		.where(eq(studentAcademicProfiles.userId, userId))
		.limit(1);
	return rows[0] ?? null;
}

export async function upsertAcademicProfile(
	profile: StudentAcademicProfile
): Promise<StudentAcademicProfile> {
	const [row] = await getDatabase()
		.insert(studentAcademicProfiles)
		.values(profile)
		.onConflictDoUpdate({
			target: studentAcademicProfiles.userId,
			set: {
				admissionYear: profile.admissionYear,
				espWaivedCourseIds: profile.espWaivedCourseIds,
				updatedAt: sql`now()`
			}
		})
		.returning();
	return row;
}

export async function findCompletions(
	userId: UserId,
	year?: number,
	term?: number
): Promise<CourseCompletion[]> {
	const predicates = [eq(courseCompletions.userId, userId)];
	if (year !== undefined) predicates.push(eq(courseCompletions.year, year));
	if (term !== undefined) predicates.push(eq(courseCompletions.term, term));
	const termOrder = sql`case ${courseCompletions.term} when 1 then 1 when 3 then 2 when 2 then 3 when 4 then 4 else ${courseCompletions.term} end`;
	return (
		await getDatabase()
			.select()
			.from(courseCompletions)
			.where(and(...predicates))
			.orderBy(asc(courseCompletions.year), termOrder)
	).map((row) => ({ ...row, credits: Number(row.credits) })) as CourseCompletion[];
}

export async function findCompletionViews(
	userId: UserId,
	year?: number,
	term?: number
): Promise<CourseCompletionView[]> {
	const completions = await findCompletions(userId, year, term);
	const [offeringMap, courseRows] = await Promise.all([
		findOfferingMapByIds(completions.flatMap((item) => (item.offeringId ? [item.offeringId] : []))),
		completions.some((item) => item.courseId)
			? getDatabase()
					.select({ id: courses.id, name: courses.name })
					.from(courses)
					.where(
						inArray(
							courses.id,
							completions.flatMap((item) => (item.courseId ? [item.courseId] : []))
						)
					)
			: Promise.resolve([])
	]);
	const courseMap = new Map(courseRows.map((row) => [row.id, row.name]));
	return completions.flatMap((completion) => {
		const offering = completion.offeringId
			? (offeringMap.get(completion.offeringId) ?? null)
			: null;
		const courseCode = offering?.courseId ?? completion.courseId;
		const courseName =
			offering?.courseName ?? (completion.courseId ? courseMap.get(completion.courseId) : null);
		if (!courseCode || !courseName) return [];
		return [
			{
				...completion,
				courseCode,
				courseName,
				offering
			}
		];
	});
}

export async function findCompletedDegreeCourses(userId: UserId): Promise<DegreeCourseInput[]> {
	const completed = and(
		eq(courseCompletions.userId, userId),
		eq(courseCompletions.status, 'passed')
	);
	const [courseRows, offeringRows] = await Promise.all([
		getDatabase()
			.select({
				code: courses.id,
				category: courses.category,
				subcategory: courses.subcategory,
				level: courses.level,
				credits: courseCompletions.credits,
				gradExcluded: courses.gradExcluded
			})
			.from(courseCompletions)
			.innerJoin(courses, eq(courseCompletions.courseId, courses.id))
			.where(completed),
		getDatabase()
			.select({
				code: courses.id,
				category: courses.category,
				subcategory: courses.subcategory,
				level: courses.level,
				credits: courseCompletions.credits,
				gradExcluded: courses.gradExcluded
			})
			.from(courseCompletions)
			.innerJoin(courseOfferings, eq(courseCompletions.offeringId, courseOfferings.id))
			.innerJoin(courses, eq(courseOfferings.courseId, courses.id))
			.where(completed)
	]);
	const rows = [...courseRows, ...offeringRows];
	return rows.map((row) => ({ ...row, credits: Number(row.credits ?? 0) }));
}

export async function createCompletion(
	value: Omit<CourseCompletion, 'id'>
): Promise<CourseCompletion | null> {
	const [row] = await getDatabase()
		.insert(courseCompletions)
		.values({ ...value, credits: String(value.credits) })
		.onConflictDoNothing({
			target: [
				courseCompletions.userId,
				courseCompletions.courseId,
				courseCompletions.year,
				courseCompletions.term
			]
		})
		.returning();
	return row ? ({ ...row, credits: Number(row.credits) } as CourseCompletion) : null;
}

export async function upsertCompletions(
	values: Array<Omit<CourseCompletion, 'id'>>
): Promise<void> {
	const set = {
		credits: sql`excluded.credits`,
		grade: sql`excluded.grade`,
		status: sql`excluded.status`,
		source: sql`excluded.source`,
		updatedAt: sql`now()`
	};
	for (const value of values) {
		const insert = getDatabase()
			.insert(courseCompletions)
			.values({ ...value, credits: String(value.credits) });
		if (value.offeringId) {
			await insert.onConflictDoUpdate({
				target: [courseCompletions.userId, courseCompletions.offeringId],
				set
			});
		} else {
			await insert.onConflictDoUpdate({
				target: [
					courseCompletions.userId,
					courseCompletions.courseId,
					courseCompletions.year,
					courseCompletions.term
				],
				set
			});
		}
	}
}

export async function deleteCompletion(id: string, userId: UserId): Promise<boolean> {
	const rows = await getDatabase()
		.delete(courseCompletions)
		.where(and(eq(courseCompletions.id, id), eq(courseCompletions.userId, userId)))
		.returning({ id: courseCompletions.id });
	return rows.length > 0;
}

export async function archiveOfferings(year: number, term: number): Promise<void> {
	await getDatabase()
		.update(courseOfferings)
		.set({ archivedAt: sql`now()`, updatedAt: sql`now()` })
		.where(and(eq(courseOfferings.year, year), eq(courseOfferings.term, term)));
}

export async function deleteStudentData(userId: UserId): Promise<void> {
	await getDatabase().delete(courseCompletions).where(eq(courseCompletions.userId, userId));
	await getDatabase()
		.delete(studentAcademicProfiles)
		.where(eq(studentAcademicProfiles.userId, userId));
	await getDatabase().delete(timetables).where(eq(timetables.userId, userId));
}

export async function upsertOfferingImport(value: OfferingImportInput) {
	await getDatabase()
		.insert(courses)
		.values({
			id: value.courseId,
			name: value.courseName,
			category: value.category,
			subcategory: value.subcategory,
			level: value.level,
			credits: String(value.credits),
			creditType: value.creditType,
			gradExcluded: value.gradExcluded
		})
		.onConflictDoUpdate({
			target: courses.id,
			set: {
				name: value.courseName,
				category: value.category ?? sql`${courses.category}`,
				subcategory: value.subcategory ?? sql`${courses.subcategory}`,
				level: value.level ?? sql`${courses.level}`,
				credits: String(value.credits),
				creditType: value.creditType,
				gradExcluded: value.gradExcluded,
				updatedAt: sql`now()`
			}
		});
	const professorIds: string[] = [];
	for (const professorName of value.professorNames) {
		const [professor] = await getDatabase()
			.insert(professors)
			.values({ name: professorName })
			.onConflictDoUpdate({ target: professors.name, set: { name: professorName } })
			.returning();
		professorIds.push(professor.id);
	}
	const [offering] = await getDatabase()
		.insert(courseOfferings)
		.values({
			courseId: value.courseId,
			year: value.year,
			term: value.term,
			section: value.section,
			subtitle: value.subtitle,
			capacity: value.capacity
		})
		.onConflictDoUpdate({
			target: [
				courseOfferings.year,
				courseOfferings.term,
				courseOfferings.courseId,
				courseOfferings.section
			],
			set: {
				subtitle: value.subtitle,
				capacity: value.capacity,
				archivedAt: null,
				updatedAt: sql`now()`
			}
		})
		.returning();
	await getDatabase()
		.delete(courseOfferingProfessors)
		.where(eq(courseOfferingProfessors.offeringId, offering.id));
	if (professorIds.length)
		await getDatabase()
			.insert(courseOfferingProfessors)
			.values(
				professorIds.map((professorId, position) => ({
					offeringId: offering.id,
					professorId,
					position
				}))
			);
	await getDatabase().delete(courseMeetings).where(eq(courseMeetings.offeringId, offering.id));
	if (value.meetings.length)
		await getDatabase()
			.insert(courseMeetings)
			.values(value.meetings.map((meeting) => ({ ...meeting, offeringId: offering.id })));
}
