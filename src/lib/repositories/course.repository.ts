import { asc, eq, inArray } from 'drizzle-orm';

import { asEntity, firstOrNull } from './repository.utils.js';

import type { CourseCreate, CourseEntity, CourseId } from '$lib/types/course.type.js';

import { courses } from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';

export async function createCourse(course: CourseCreate): Promise<CourseEntity> {
	const [created] = await getDatabase().insert(courses).values(course).returning();
	return asEntity<CourseEntity>(created);
}

export async function findCourseById(courseId: CourseId): Promise<CourseEntity | null> {
	const rows = await getDatabase().select().from(courses).where(eq(courses.id, courseId)).limit(1);
	return asEntity<CourseEntity | null>(firstOrNull(rows));
}

export async function findCourses(): Promise<CourseEntity[]> {
	return asEntity<CourseEntity[]>(
		await getDatabase().select().from(courses).orderBy(asc(courses.id))
	);
}

export async function findCoursesByIds(courseIds: CourseId[]): Promise<Array<CourseEntity | null>> {
	if (courseIds.length === 0) return [];
	const rows = await getDatabase().select().from(courses).where(inArray(courses.id, courseIds));
	const courseIdToCourse = new Map(rows.map((course) => [course.id, course]));
	return asEntity<Array<CourseEntity | null>>(
		courseIds.map((courseId) => courseIdToCourse.get(courseId) ?? null)
	);
}
