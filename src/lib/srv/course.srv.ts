import type { CourseCreate, Course, CourseId, CourseUpdate } from '$lib/types/course.type.js';
import type { User } from '$lib/types/user.type.js';

import * as CourseRepository from '$lib/repo/course.repo.js';
import * as CoursePerm from '$lib/perm/course.perm.js';

export async function createCourse(course: CourseCreate, user: User): Promise<Course> {
	if (!CoursePerm.canManageCourse(user)) throw new Error('권한이 없습니다.');
	if (await getCourseByCode(course.code)) throw new Error('이미 존재하는 강의입니다.');
	return await CourseRepository.createCourse(course);
}

export async function getCourseByCode(courseCode: string): Promise<Course> {
	const course = await CourseRepository.getCourseByCode(courseCode);
	if (!course) throw new Error('존재하지 않는 강의입니다.');
	return course;
}

export async function getCourseById(courseId: CourseId): Promise<Course> {
	const course = await CourseRepository.getCourseById(courseId);
	if (!course) throw new Error('존재하지 않는 강의입니다.');
	return course;
}

export async function getAllCourses(): Promise<Course[]> {
	return await CourseRepository.getAllCourses();
}

export async function getCoursesOrNullByIds(ids: CourseId[]): Promise<Array<Course | null>> {
	return await CourseRepository.getCoursesByIds(ids);
}

export async function updateCourseById(
	courseId: CourseId,
	course: CourseUpdate,
	user: User
): Promise<Course> {
	if (!CoursePerm.canManageCourse(user)) throw new Error('권한이 없습니다.');
	const updatedCourse = await CourseRepository.updateCourseById(courseId, course);
	if (!updatedCourse) throw new Error('존재하지 않는 강의입니다.');
	return updatedCourse;
}

export async function deleteCourseById(courseId: CourseId, user: User): Promise<void> {
	if (!CoursePerm.canManageCourse(user)) throw new Error('권한이 없습니다.');
	const deletedCourse = await CourseRepository.deleteCourseById(courseId);
	if (!deletedCourse) throw new Error('존재하지 않는 강의입니다.');
}

export async function createCourseByIdMap<T extends { courseId: CourseId }>(
	arr: T[]
): Promise<Map<string, Course>> {
	const courseIds = arr.map((item) => item.courseId);
	const courses = await CourseRepository.getCoursesByIds(courseIds);
	const courseById = new Map<string, Course>();

	for (const course of courses) {
		if (!course) continue;
		if (courseById.has(course._id.toString())) continue;
		courseById.set(course._id.toString(), course);
	}

	return courseById;
}

export async function fillCourseInfosByCourseIds<T extends { courseId: CourseId }>(
	arr: T[]
): Promise<T[]> {
	const courseById = await createCourseByIdMap(arr);
	return arr.map((item) => {
		const course = courseById.get(item.courseId.toString());
		return {
			...item,
			courseCode: course?.code ?? null,
			courseName: course?.name ?? null
		};
	});
}
