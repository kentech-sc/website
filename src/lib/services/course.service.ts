import type { Course, CourseCreate, CourseId } from '$lib/types/course.type.js';
import type { User } from '$lib/types/user.type.js';

import * as CourseRepository from '$lib/repositories/course.repository.js';
import * as CourseRule from '$lib/rules/course.rule.js';
import { assertRule } from '$lib/server/errors.js';

export async function createCourse(course: CourseCreate, user: User): Promise<Course> {
	assertRule(CourseRule.canManageCourse(user));

	const duplicate = await CourseRepository.findCourseById(course._id);
	assertRule(CourseRule.validateCourseCreate(duplicate !== null));

	return await CourseRepository.createCourse(course);
}

export async function findCourses(): Promise<Course[]> {
	return await CourseRepository.findCourses();
}

export async function findCourseMapByIds(courseIds: CourseId[]): Promise<Map<string, Course>> {
	const uniqueCourseIds = Array.from(new Set(courseIds.map((courseId) => courseId.toString())));
	if (uniqueCourseIds.length === 0) return new Map();

	const courses = await CourseRepository.findCoursesByIds(uniqueCourseIds);
	const courseIdToCourse = new Map<string, Course>();

	for (const course of courses) {
		if (!course) continue;
		courseIdToCourse.set(course._id.toString(), course);
	}

	return courseIdToCourse;
}
