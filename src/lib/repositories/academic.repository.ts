import { and, asc, desc, eq, gte, inArray, isNull, lte, sql } from 'drizzle-orm';

import type {
	CourseCompletion,
	CourseCompletionView,
	ExternalCourse,
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
	externalCourses,
	graduationPolicies,
	professors,
	studentAcademicProfiles,
	timetables
} from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';
import { AP_COURSE_CREDITS, isApCreditCode } from '$lib/shared/academic-credit.js';

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
	return (
		await getDatabase()
			.select()
			.from(courseCompletions)
			.where(and(...predicates))
			.orderBy(asc(courseCompletions.year), asc(courseCompletions.term))
	).map((row) => ({ ...row, credits: Number(row.credits) })) as CourseCompletion[];
}

export async function findExternalCourseMapByIds(
	ids: string[]
): Promise<Map<string, ExternalCourse>> {
	const uniqueIds = [...new Set(ids)];
	if (!uniqueIds.length) return new Map();
	const rows = await getDatabase()
		.select({
			id: externalCourses.id,
			institution: externalCourses.institution,
			courseCode: externalCourses.courseCode,
			name: externalCourses.name
		})
		.from(externalCourses)
		.where(inArray(externalCourses.id, uniqueIds));
	return new Map(rows.map((row) => [row.id, row]));
}

export async function findCompletionViews(
	userId: UserId,
	year?: number,
	term?: number
): Promise<CourseCompletionView[]> {
	const completions = await findCompletions(userId, year, term);
	const [offeringMap, externalMap, courseRows] = await Promise.all([
		findOfferingMapByIds(completions.flatMap((item) => (item.offeringId ? [item.offeringId] : []))),
		findExternalCourseMapByIds(
			completions.flatMap((item) => (item.externalCourseId ? [item.externalCourseId] : []))
		),
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
		const external = completion.externalCourseId
			? (externalMap.get(completion.externalCourseId) ?? null)
			: null;
		const courseCode = offering?.courseId ?? completion.courseId ?? external?.courseCode;
		const courseName =
			offering?.courseName ??
			(completion.courseId ? courseMap.get(completion.courseId) : null) ??
			external?.name;
		if (!courseCode || !courseName) return [];
		return [
			{
				...completion,
				courseCode,
				courseName,
				institution: external?.institution ?? null,
				isExternal: external !== null,
				isCreditRecognition: isApCreditCode(courseCode),
				offering
			}
		];
	});
}

export async function upsertApCreditCourses(
	values: Array<{ id: string; name: string }>
): Promise<void> {
	const uniqueValues = [
		...new Map(
			values.map((value) => [value.id, { id: value.id, name: value.name || value.id }])
		).values()
	];
	if (!uniqueValues.length) return;

	await getDatabase()
		.insert(courses)
		.values(
			uniqueValues.map((value) => ({
				id: value.id,
				name: value.name,
				category: 'EF',
				subcategory: 'ap',
				level: null,
				credits: String(AP_COURSE_CREDITS),
				creditType: 'numeric',
				gradExcluded: false
			}))
		)
		.onConflictDoUpdate({
			target: courses.id,
			set: {
				name: sql`case when ${courses.name} in (${courses.id}, 'AP 인정학점') then excluded.name else ${courses.name} end`,
				category: 'EF',
				subcategory: 'ap',
				level: null,
				credits: sql`${courses.credits}`,
				creditType: sql`${courses.creditType}`,
				gradExcluded: false,
				updatedAt: sql`now()`
			}
		});
}

export async function findCompletedDegreeCourses(userId: UserId): Promise<DegreeCourseInput[]> {
	const completed = and(
		eq(courseCompletions.userId, userId),
		eq(courseCompletions.status, 'passed')
	);
	const [courseRows, offeringRows, externalRows] = await Promise.all([
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
			.where(completed),
		getDatabase()
			.select({
				code: sql<string>`'EXT:' || ${externalCourses.id}::text`,
				category: sql<string>`'FR'`,
				subcategory: sql<string | null>`null`,
				level: sql<number | null>`null`,
				credits: courseCompletions.credits,
				gradExcluded: sql<boolean>`false`
			})
			.from(courseCompletions)
			.innerJoin(externalCourses, eq(courseCompletions.externalCourseId, externalCourses.id))
			.where(completed)
	]);
	const rows = [...courseRows, ...offeringRows, ...externalRows];
	return rows.map((row) => ({ ...row, credits: Number(row.credits ?? 0) }));
}

export async function upsertExternalCourse(value: {
	institution: string;
	courseCode: string;
	name: string;
}): Promise<ExternalCourse> {
	const [row] = await getDatabase()
		.insert(externalCourses)
		.values(value)
		.onConflictDoUpdate({
			target: [externalCourses.institution, externalCourses.courseCode],
			set: { name: value.name, updatedAt: sql`now()` }
		})
		.returning({
			id: externalCourses.id,
			institution: externalCourses.institution,
			courseCode: externalCourses.courseCode,
			name: externalCourses.name
		});
	return row;
}

export async function createCompletion(
	value: Omit<CourseCompletion, 'id'>
): Promise<CourseCompletion> {
	const [row] = await getDatabase()
		.insert(courseCompletions)
		.values({ ...value, credits: String(value.credits) })
		.returning();
	return { ...row, credits: Number(row.credits) } as CourseCompletion;
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
		} else if (value.externalCourseId) {
			await insert.onConflictDoUpdate({
				target: [
					courseCompletions.userId,
					courseCompletions.externalCourseId,
					courseCompletions.year,
					courseCompletions.term
				],
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
