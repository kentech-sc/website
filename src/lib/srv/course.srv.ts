import type { CourseCreate, Course, CourseId, CourseUpdate } from '$lib/types/course.type.js';
import type { User } from '$lib/types/user.type.js';

import * as CourseRepository from '$lib/repo/course.repo.js';
import * as CourseRule from '$lib/rules/course.rule.js';

import { RuleError, SrvError } from '$lib/common/errors.js';

export async function createCourse(course: CourseCreate, user: User): Promise<Course> {
	if (!CourseRule.canManageCourse(user)) throw new RuleError('권한이 없습니다.');
	if (await getCourseByCode(course.code)) throw new SrvError('이미 존재하는 강의입니다.');
	return await CourseRepository.createCourse(course);
}

export async function getCourseByCode(courseCode: string): Promise<Course> {
	const course = await CourseRepository.getCourseByCode(courseCode);
	if (!course) throw new SrvError('존재하지 않는 강의입니다.');
	return course;
}

export async function getCourseById(courseId: CourseId): Promise<Course> {
	const course = await CourseRepository.getCourseById(courseId);
	if (!course) throw new SrvError('존재하지 않는 강의입니다.');
	return course;
}

export async function getAllCourses(): Promise<Course[]> {
	return await CourseRepository.getAllCourses();
}

export async function updateCourseById(
	courseId: CourseId,
	course: CourseUpdate,
	user: User
): Promise<Course> {
	if (!CourseRule.canManageCourse(user)) throw new RuleError('권한이 없습니다.');
	const updatedCourse = await CourseRepository.updateCourseById(courseId, course);
	if (!updatedCourse) throw new SrvError('존재하지 않는 강의입니다.');
	return updatedCourse;
}

export async function deleteCourseById(courseId: CourseId, user: User): Promise<Course> {
	const course = await CourseRepository.getCourseById(courseId);
	if (!course) throw new SrvError('존재하지 않는 강의입니다.');

	if (!CourseRule.canManageCourse(user)) throw new RuleError('권한이 없습니다.');

	const isDeleted = await CourseRepository.deleteCourseById(courseId);
	if (!isDeleted) throw new SrvError('이미 삭제된 강의입니다.');

	return course;
}

export async function getCourseMapByIds(courseIds: CourseId[]): Promise<Map<string, Course>> {
	const courses = await CourseRepository.getCoursesByIds(courseIds);

	const map = new Map<string, Course>();
	for (const course of courses) {
		if (!course) continue;
		map.set(course._id.toString(), course);
	}

	return map;
}

// Array<{ ... , courseId }>를 받음. 각 item의 courseId로 course 정보를 item에 추가하여 반환.
export async function attachCourseInfo<T extends { courseId: CourseId }>(
	arr: T[]
): Promise<(T & { courseCode: string | null; courseName: string | null })[]> {
	const courseMap = await getCourseMapByIds(arr.map((item) => item.courseId));

	return arr.map((item) => {
		const course = courseMap.get(item.courseId.toString());
		return {
			...item,
			courseCode: course?.code ?? null,
			courseName: course?.name ?? null
		};
	});
}
