import type { CourseId, CourseCreate, CourseEntity } from '$lib/types/course.type.js';

import { CourseModel } from '$lib/models/course.model.js';
import { toPojo } from '$lib/shared/utils.js';

export async function createCourse(course: CourseCreate): Promise<CourseEntity> {
	return toPojo<CourseEntity>((await CourseModel.create(course)).toObject());
}

export async function findCourseById(courseId: CourseId): Promise<CourseEntity | null> {
	return toPojo<CourseEntity | null>(await CourseModel.findOne({ _id: courseId }).lean());
}

export async function findCourses(): Promise<CourseEntity[]> {
	return toPojo<CourseEntity[]>(await CourseModel.find().sort({ _id: 1 }).lean());
}

export async function findCoursesByIds(
	courseIds: CourseId[]
): Promise<Array<CourseEntity | null>> {
	const courses = await CourseModel.find({ _id: { $in: courseIds } }).lean();
	const courseIdToCourse = new Map(courses.map((course) => [course._id.toString(), course]));

	return toPojo<Array<CourseEntity | null>>(
		courseIds.map((courseId) => courseIdToCourse.get(courseId.toString()) ?? null)
	);
}
