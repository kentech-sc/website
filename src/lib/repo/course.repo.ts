import type { CourseId, Course, CourseCreate, CourseUpdate } from '$lib/types/course.type';
import CourseModel from '$lib/models/course.model.js';

export async function createCourse(course: CourseCreate): Promise<Course> {
	return (await CourseModel.create(course)).toObject();
}

export async function getCourseById(courseId: CourseId): Promise<Course | null> {
	return await CourseModel.findOne({ _id: courseId }).lean();
}

export async function getCourseByCode(code: string): Promise<Course | null> {
	return await CourseModel.findOne({ code }).lean();
}

export async function getAllCourses(): Promise<Course[]> {
	return await CourseModel.find().sort({ code: 1 }).lean();
}

export async function getCoursesByIds(courseIds: CourseId[]): Promise<Array<Course | null>> {
	const courses = await CourseModel.find({ _id: { $in: courseIds } }).lean();

	const courseById = new Map<string, Course>();
	for (const course of courses) {
		courseById.set(course._id.toString(), course);
	}

	return courseIds.map((courseId) => courseById.get(courseId.toString()) ?? null);
}

export async function updateCourseById(
	courseId: CourseId,
	course: CourseUpdate
): Promise<Course | null> {
	return await CourseModel.findOneAndUpdate({ _id: courseId }, course, { new: true }).lean();
}

export async function deleteCourseById(courseId: CourseId): Promise<Course | null> {
	return await CourseModel.findOneAndDelete({ _id: courseId }).lean();
}
