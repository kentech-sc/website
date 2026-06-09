import type { Course, CourseCreate, CourseId } from '$lib/types/course.type.js';
import type { User } from '$lib/types/user.type.js';

import { assertRule } from '$lib/server/errors.js';

import * as CourseRepository from '$lib/repositories/course.repository.js';
import * as CourseRule from '$lib/rules/course.rule.js';

export async function createCourse(course: CourseCreate, user: User): Promise<Course> {
	assertRule(CourseRule.canManageCourse(user));

	const duplicate = await CourseRepository.findCourseById(course._id);
	assertRule(CourseRule.validateCourseCreate(duplicate !== null));

	return await CourseRepository.createCourse(course);
}

export async function findCourses(): Promise<Course[]> {
	return await CourseRepository.findCourses();
}

async function getCourseIdToCourse(courseIds: CourseId[]): Promise<Map<string, Course>> {
	const courses = await CourseRepository.findCoursesByIds(courseIds);

	const courseIdToCourse = new Map<string, Course>();
	for (const course of courses) {
		if (!course) continue;
		courseIdToCourse.set(course._id.toString(), course);
	}

	return courseIdToCourse;
}

export async function attachCourseInfo<T extends { courseId: CourseId }>(
	items: T[]
): Promise<(T & { courseName: string | null })[]> {
	const courseIdToCourse = await getCourseIdToCourse(items.map((item) => item.courseId));

	return items.map((item) => {
		const course = courseIdToCourse.get(item.courseId.toString());
		return {
			...item,
			courseName: course?.name ?? null
		};
	});
}
