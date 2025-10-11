import type { CourseCreate, Course, CourseId, CourseUpdate } from './types.js';
import CourseRepository from './repository.js';
import type { User } from '$lib/user/types.js';

export default class CourseService {
	static #canManageCourse(user: User): boolean {
		return user.group === 'manager';
	}

	static async createCourse(course: CourseCreate, user: User): Promise<Course> {
		if (!this.#canManageCourse(user)) throw new Error('권한이 없습니다.');
		if (await this.getCourseByCode(course.code)) throw new Error('이미 존재하는 강의입니다.');
		return await CourseRepository.createCourse(course);
	}

	static async getCourseByCode(courseCode: string): Promise<Course> {
		const course = await CourseRepository.getCourseByCode(courseCode);
		if (!course) throw new Error('존재하지 않는 강의입니다.');
		return course;
	}

	static async getCourseById(courseId: CourseId): Promise<Course> {
		const course = await CourseRepository.getCourseById(courseId);
		if (!course) throw new Error('존재하지 않는 강의입니다.');
		return course;
	}

	static async getAllCourses(): Promise<Course[]> {
		return await CourseRepository.getAllCourses();
	}

	static async getCoursesOrNullByIds(ids: CourseId[]): Promise<Array<Course | null>> {
		return await CourseRepository.getCoursesByIds(ids);
	}

	static async updateCourseById(
		courseId: CourseId,
		course: CourseUpdate,
		user: User
	): Promise<Course> {
		if (!this.#canManageCourse(user)) throw new Error('권한이 없습니다.');
		const updatedCourse = await CourseRepository.updateCourseById(courseId, course);
		if (!updatedCourse) throw new Error('존재하지 않는 강의입니다.');
		return updatedCourse;
	}

	static async deleteCourseById(courseId: CourseId, user: User): Promise<void> {
		if (!this.#canManageCourse(user)) throw new Error('권한이 없습니다.');
		const deletedCourse = await CourseRepository.deleteCourseById(courseId);
		if (!deletedCourse) throw new Error('존재하지 않는 강의입니다.');
	}

	static async #createCourseByIdMap<T extends { courseId: CourseId }>(
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

	static async fillCourseInfosByCourseIds<T extends { courseId: CourseId }>(
		arr: T[]
	): Promise<T[]> {
		const courseById = await this.#createCourseByIdMap(arr);
		return arr.map((item) => {
			const course = courseById.get(item.courseId.toString());
			return {
				...item,
				courseCode: course?.code ?? null,
				courseName: course?.name ?? null
			};
		});
	}
}
