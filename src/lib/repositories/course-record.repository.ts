import { and, asc, eq, inArray, sql } from 'drizzle-orm';

import type { CourseRecord, CourseRecordView, AcademicCareer } from '$lib/types/academic.type.js';
import type { DegreeCourseInput } from '$lib/types/degree.type.js';
import type { UserId } from '$lib/types/user.type.js';

import * as OfferingRepository from '$lib/repositories/offering.repository.js';
import { courseRecords, courseOfferings, courses } from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';
export async function findCourseRecords(
	userId: UserId,
	year?: number,
	term?: number
): Promise<CourseRecord[]> {
	const predicates = [eq(courseRecords.userId, userId)];
	if (year !== undefined) predicates.push(eq(courseRecords.year, year));
	if (term !== undefined) predicates.push(eq(courseRecords.term, term));
	const termOrder = sql`case ${courseRecords.term} when 1 then 1 when 3 then 2 when 2 then 3 when 4 then 4 else ${courseRecords.term} end`;
	return (
		await getDatabase()
			.select()
			.from(courseRecords)
			.where(and(...predicates))
			.orderBy(asc(courseRecords.year), termOrder)
	).map((row) => ({ ...row, credits: Number(row.credits) })) as CourseRecord[];
}

export async function findCourseRecordViews(
	userId: UserId,
	year?: number,
	term?: number
): Promise<CourseRecordView[]> {
	const records = await findCourseRecords(userId, year, term);
	const [offeringMap, courseRows] = await Promise.all([
		OfferingRepository.findOfferingMapByIds(
			records.flatMap((item) => (item.offeringId ? [item.offeringId] : []))
		),
		records.some((item) => item.courseId)
			? getDatabase()
					.select({ id: courses.id, name: courses.name })
					.from(courses)
					.where(
						inArray(
							courses.id,
							records.flatMap((item) => (item.courseId ? [item.courseId] : []))
						)
					)
			: Promise.resolve([])
	]);
	const courseMap = new Map(courseRows.map((row) => [row.id, row.name]));
	return records.flatMap((record) => {
		const offering = record.offeringId ? (offeringMap.get(record.offeringId) ?? null) : null;
		const courseCode = offering?.courseId ?? record.courseId;
		const courseName =
			offering?.courseName ?? (record.courseId ? courseMap.get(record.courseId) : null);
		if (!courseCode || !courseName) return [];
		return [
			{
				...record,
				courseCode,
				courseName,
				offering
			}
		];
	});
}

export async function findCompletedDegreeCourses(userId: UserId): Promise<DegreeCourseInput[]> {
	const completed = and(eq(courseRecords.userId, userId), eq(courseRecords.status, 'passed'));
	const [courseRows, offeringRows] = await Promise.all([
		getDatabase()
			.select({
				code: courses.id,
				academicCareer: sql<'undergraduate' | 'graduate'>`case
					when exists (
						select 1 from ${courseOfferings}
						where ${courseOfferings.courseId} = ${courses.id}
							and ${courseOfferings.year} = ${courseRecords.year}
							and ${courseOfferings.term} = ${courseRecords.term}
							and ${courseOfferings.academicCareer} = 'graduate'
					) and not exists (
						select 1 from ${courseOfferings}
						where ${courseOfferings.courseId} = ${courses.id}
							and ${courseOfferings.year} = ${courseRecords.year}
							and ${courseOfferings.term} = ${courseRecords.term}
							and ${courseOfferings.academicCareer} = 'undergraduate'
					) then 'graduate'
					else 'undergraduate'
				end`,
				category: courses.category,
				subcategory: courses.subcategory,
				level: courses.level,
				credits: courseRecords.credits,
				excludedFromGraduation: courses.excludedFromGraduation
			})
			.from(courseRecords)
			.innerJoin(courses, eq(courseRecords.courseId, courses.id))
			.where(completed),
		getDatabase()
			.select({
				code: courses.id,
				category: courses.category,
				subcategory: courses.subcategory,
				level: courses.level,
				credits: courseRecords.credits,
				excludedFromGraduation: courses.excludedFromGraduation,
				academicCareer: courseOfferings.academicCareer
			})
			.from(courseRecords)
			.innerJoin(courseOfferings, eq(courseRecords.offeringId, courseOfferings.id))
			.innerJoin(courses, eq(courseOfferings.courseId, courses.id))
			.where(completed)
	]);
	const rows = [...courseRows, ...offeringRows];
	return rows.map((row) => ({
		...row,
		academicCareer: row.academicCareer as AcademicCareer,
		credits: Number(row.credits ?? 0)
	}));
}

export async function createCourseRecord(
	value: Omit<CourseRecord, 'id'>
): Promise<CourseRecord | null> {
	const [row] = await getDatabase()
		.insert(courseRecords)
		.values({ ...value, credits: String(value.credits) })
		.onConflictDoNothing({
			target: [courseRecords.userId, courseRecords.courseId, courseRecords.year, courseRecords.term]
		})
		.returning();
	return row ? ({ ...row, credits: Number(row.credits) } as CourseRecord) : null;
}

export async function upsertCourseRecords(values: Array<Omit<CourseRecord, 'id'>>): Promise<void> {
	const set = {
		credits: sql`excluded.credits`,
		grade: sql`excluded.grade`,
		status: sql`excluded.status`,
		source: sql`excluded.source`,
		updatedAt: sql`now()`
	};
	for (const value of values) {
		const insert = getDatabase()
			.insert(courseRecords)
			.values({ ...value, credits: String(value.credits) });
		if (value.offeringId) {
			await insert.onConflictDoUpdate({
				target: [courseRecords.userId, courseRecords.offeringId],
				set
			});
		} else {
			await insert.onConflictDoUpdate({
				target: [
					courseRecords.userId,
					courseRecords.courseId,
					courseRecords.year,
					courseRecords.term
				],
				set
			});
		}
	}
}

export async function deleteCourseRecord(id: string, userId: UserId): Promise<boolean> {
	const rows = await getDatabase()
		.delete(courseRecords)
		.where(and(eq(courseRecords.id, id), eq(courseRecords.userId, userId)))
		.returning({ id: courseRecords.id });
	return rows.length > 0;
}
