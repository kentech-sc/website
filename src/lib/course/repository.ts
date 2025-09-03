import type { CourseId, Course, CourseCreate, CourseUpdate } from './types.js';
import CourseModel from './model.js';

export default class CourseRepository {
	static async createCourse(course: CourseCreate): Promise<Course> {
		return (await CourseModel.create(course)).toObject();
	}

	static async getCourseById(courseId: CourseId): Promise<Course | null> {
		return await CourseModel.findOne({ _id: courseId }).lean();
	}

	static async getCourseByCode(code: string): Promise<Course | null> {
		return await CourseModel.findOne({ code }).lean();
	}

	static async getAllCourses(): Promise<Course[]> {
		return await CourseModel.find().sort({ code: 1 }).lean();
	}

	static async getCoursesByIds(courseIds: CourseId[]): Promise<Array<Course | null>> {
		const courses = await CourseModel.find({ _id: { $in: courseIds } }).lean();

		const courseById = new Map<string, Course>();
		for (const course of courses) {
			courseById.set(course._id.toString(), course);
		}

		return courseIds.map((courseId) => courseById.get(courseId.toString()) ?? null);
	}

	static async updateCourseById(courseId: CourseId, course: CourseUpdate): Promise<Course | null> {
		return await CourseModel.findOneAndUpdate({ _id: courseId }, course, { new: true }).lean();
	}

	static async deleteCourseById(courseId: CourseId): Promise<Course | null> {
		return await CourseModel.findOneAndDelete({ _id: courseId }).lean();
	}
}
