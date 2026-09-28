import { and, asc, desc, eq, inArray, isNull, sql } from 'drizzle-orm';

import type {
	AcademicCareer,
	Offering,
	OfferingCreditType,
	OfferingImportInput,
	ReviewableOffering
} from '$lib/types/academic.type.js';

import {
	courseMeetings,
	courseOfferingProfessors,
	courseOfferings,
	courses,
	professors
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
			excludedFromGraduation: courses.excludedFromGraduation
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
				excludedFromGraduation
			}) => [
				offering.id,
				{
					...offering,
					academicCareer: offering.academicCareer as AcademicCareer,
					credits: Number(credits),
					creditType: creditType as OfferingCreditType,
					courseName,
					category,
					subcategory,
					level,
					excludedFromGraduation,
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

export async function findAllReviewableOfferings(): Promise<ReviewableOffering[]> {
	const rows = await getDatabase()
		.select({
			id: courseOfferings.id,
			courseId: courseOfferings.courseId,
			courseName: courses.name,
			subtitle: courseOfferings.subtitle,
			year: courseOfferings.year,
			term: courseOfferings.term
		})
		.from(courseOfferings)
		.innerJoin(courses, eq(courseOfferings.courseId, courses.id))
		.where(isNull(courseOfferings.archivedAt))
		.orderBy(
			desc(courseOfferings.year),
			desc(courseOfferings.term),
			asc(courseOfferings.courseId),
			asc(courseOfferings.section)
		);
	const professorRows = rows.length
		? await getDatabase()
				.select({
					offeringId: courseOfferingProfessors.offeringId,
					id: professors.id,
					name: professors.name
				})
				.from(courseOfferingProfessors)
				.innerJoin(professors, eq(courseOfferingProfessors.professorId, professors.id))
				.where(
					inArray(
						courseOfferingProfessors.offeringId,
						rows.map((row) => row.id)
					)
				)
				.orderBy(asc(courseOfferingProfessors.position))
		: [];
	const professorsByOffering = new Map<string, Array<{ id: string; name: string }>>();
	for (const { offeringId, id, name } of professorRows)
		professorsByOffering.set(offeringId, [
			...(professorsByOffering.get(offeringId) ?? []),
			{ id, name }
		]);
	return rows.map((row) => ({
		...row,
		professors: professorsByOffering.get(row.id) ?? []
	}));
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

/** 교수별로 담당한 적 있는 강의 코드 목록. (강의평 필터에서 교수 -> 강의 좁히기에 사용) */
export async function findCourseIdsByProfessor(): Promise<Record<string, string[]>> {
	const rows = await getDatabase()
		.selectDistinct({
			professorId: courseOfferingProfessors.professorId,
			courseId: courseOfferings.courseId
		})
		.from(courseOfferingProfessors)
		.innerJoin(courseOfferings, eq(courseOfferings.id, courseOfferingProfessors.offeringId));

	const courseIdsByProfessor: Record<string, string[]> = {};
	for (const { professorId, courseId } of rows)
		(courseIdsByProfessor[professorId] ??= []).push(courseId);
	return courseIdsByProfessor;
}

export async function archiveOfferings(
	year: number,
	term: number,
	academicCareer: AcademicCareer
): Promise<void> {
	await getDatabase()
		.update(courseOfferings)
		.set({ archivedAt: sql`now()`, updatedAt: sql`now()` })
		.where(
			and(
				eq(courseOfferings.year, year),
				eq(courseOfferings.term, term),
				eq(courseOfferings.academicCareer, academicCareer)
			)
		);
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
			excludedFromGraduation: value.excludedFromGraduation
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
				excludedFromGraduation: value.excludedFromGraduation,
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
			academicCareer: value.academicCareer,
			section: value.section,
			subtitle: value.subtitle,
			capacity: value.capacity
		})
		.onConflictDoUpdate({
			target: [
				courseOfferings.year,
				courseOfferings.term,
				courseOfferings.academicCareer,
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
