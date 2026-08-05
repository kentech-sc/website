import { asc, inArray } from 'drizzle-orm';

import { asEntity } from './repository.utils.js';

import type { CatalogCourseCreate, CourseEntity, CourseId } from '$lib/types/course.type.js';

import { courses } from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';

export async function findCourses(): Promise<CourseEntity[]> {
	return (await getDatabase().select().from(courses).orderBy(asc(courses.id))).map((course) => ({
		...course,
		credits: Number(course.credits),
		creditType: course.creditType as CourseEntity['creditType']
	}));
}

export async function findCoursesByIds(courseIds: CourseId[]): Promise<Array<CourseEntity | null>> {
	if (courseIds.length === 0) return [];
	const rows = await getDatabase().select().from(courses).where(inArray(courses.id, courseIds));
	const courseIdToCourse = new Map(
		rows.map((course) => [
			course.id,
			{
				...course,
				credits: Number(course.credits),
				creditType: course.creditType as CourseEntity['creditType']
			}
		])
	);
	return asEntity<Array<CourseEntity | null>>(
		courseIds.map((courseId) => courseIdToCourse.get(courseId) ?? null)
	);
}

export async function createCourse(value: CatalogCourseCreate): Promise<CourseEntity | null> {
	const [course] = await getDatabase()
		.insert(courses)
		.values({ ...value, credits: String(value.credits) })
		.onConflictDoNothing({ target: courses.id })
		.returning({
			id: courses.id,
			name: courses.name,
			credits: courses.credits,
			creditType: courses.creditType
		});
	return course
		? {
				...course,
				credits: Number(course.credits),
				creditType: course.creditType as CourseEntity['creditType']
			}
		: null;
}
