import type {
	CourseId,
	Course,
	CourseCreate,
	CourseUpdate,
	ProfessorId,
	Professor,
	ProfessorCreate,
	ProfessorUpdate
} from './types.js';
import { CourseModel, ProfessorModel } from './model.js';

export class CourseController {
	static async createCourse(course: CourseCreate): Promise<Course> {
		return (await CourseModel.create(course)).toObject();
	}

	static async getCourseById(id: CourseId): Promise<Course | null> {
		return await CourseModel.findOne({ _id: id }).lean();
	}

	static async getCourseByCode(code: string): Promise<Course | null> {
		return await CourseModel.findOne({ code }).lean();
	}

	static async getAllCourses(): Promise<Course[]> {
		return await CourseModel.find().sort({ code: 1 }).lean();
	}

	static async getCoursesByIdArr(idArr: CourseId[]): Promise<Array<Course | null>> {
		const courseArr = await CourseModel.find({ _id: { $in: idArr } }).lean();

		const courseMap = new Map<string, Course>();
		for (const course of courseArr) {
			courseMap.set(course._id.toString(), course);
		}

		return idArr.map((id) => courseMap.get(id.toString()) ?? null);
	}

	static async updateCourseById(id: CourseId, course: CourseUpdate): Promise<Course | null> {
		return await CourseModel.findOneAndUpdate({ _id: id }, course, { new: true }).lean();
	}

	static async deleteCourseById(id: CourseId): Promise<void> {
		await CourseModel.deleteOne({ _id: id });
	}
}

export class ProfessorController {
	static async createProfessor(professor: ProfessorCreate): Promise<Professor> {
		return (await ProfessorModel.create(professor)).toObject();
	}

	static async getProfessorById(id: ProfessorId): Promise<Professor | null> {
		return await ProfessorModel.findOne({ _id: id }).lean();
	}

	static async getProfessorByName(name: string): Promise<Professor | null> {
		return await ProfessorModel.findOne({ name }).lean();
	}

	static async getAllProfessors(): Promise<Professor[]> {
		return await ProfessorModel.find().sort({ name: 1 }).lean();
	}

	static async getProfessorsByIdArr(idArr: ProfessorId[]): Promise<Array<Professor | null>> {
		const professorArr = await ProfessorModel.find({ _id: { $in: idArr } }).lean();

		const professorMap = new Map<string, Professor>();
		for (const professor of professorArr) {
			professorMap.set(professor._id.toString(), professor);
		}

		return idArr.map((id) => professorMap.get(id.toString()) ?? null);
	}

	static async updateProfessorById(
		id: ProfessorId,
		professor: ProfessorUpdate
	): Promise<Professor | null> {
		return await ProfessorModel.findOneAndUpdate({ _id: id }, professor, { new: true }).lean();
	}

	static async deleteProfessorById(id: ProfessorId): Promise<void> {
		await ProfessorModel.deleteOne({ _id: id });
	}
}
