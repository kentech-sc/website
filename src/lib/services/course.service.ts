import type { CatalogCourseCreate, Course, CourseId } from '$lib/types/course.type.js';

import * as CourseRepository from '$lib/repositories/course.repository.js';
import { isApCreditCode } from '$lib/shared/academic-credit.js';

export async function findCourses(): Promise<Course[]> {
	return await CourseRepository.findCourses();
}

export async function findInstructionalCourses(): Promise<Course[]> {
	return (await findCourses()).filter((course) => !isApCreditCode(course.id));
}

export async function createCourse(value: CatalogCourseCreate): Promise<Course | null> {
	return await CourseRepository.createCourse(value);
}

export async function findCourseMapByIds(courseIds: CourseId[]): Promise<Map<string, Course>> {
	const uniqueCourseIds = Array.from(new Set(courseIds.map((courseId) => courseId.toString())));
	if (uniqueCourseIds.length === 0) return new Map();

	const courses = await CourseRepository.findCoursesByIds(uniqueCourseIds);
	const courseIdToCourse = new Map<string, Course>();

	for (const course of courses) {
		if (!course) continue;
		courseIdToCourse.set(course.id.toString(), course);
	}

	return courseIdToCourse;
}
