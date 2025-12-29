import type { CourseId, CourseCreate, CourseUpdate, CourseDoc } from '$lib/types/course.type.js';

import { CourseModel } from '$lib/models/course.model.js';

export async function createCourse(course: CourseCreate): Promise<CourseDoc> {
	return (await CourseModel.create(course)).toObject();
}

export async function getCourseById(courseId: CourseId): Promise<CourseDoc | null> {
	return await CourseModel.findOne({ _id: courseId }).lean();
}

export async function getCourseByCode(code: string): Promise<CourseDoc | null> {
	return await CourseModel.findOne({ code }).lean();
}

export async function getAllCourses(): Promise<CourseDoc[]> {
	return await CourseModel.find().sort({ code: 1 }).lean();
}

export async function getCoursesByIds(courseIds: CourseId[]): Promise<Array<CourseDoc | null>> {
	const courses = await CourseModel.find({ _id: { $in: courseIds } }).lean();

	const map = new Map(courses.map((course) => [course._id.toString(), course]));

	return courseIds.map((courseId) => map.get(courseId.toString()) ?? null);
}

export async function updateCourseById(
	courseId: CourseId,
	course: CourseUpdate
): Promise<CourseDoc | null> {
	return await CourseModel.findOneAndUpdate({ _id: courseId }, course, { new: true }).lean();
}

export async function deleteCourseById(courseId: CourseId): Promise<boolean> {
	const res = await CourseModel.deleteOne({ _id: courseId });
	return res.deletedCount > 0;
}
