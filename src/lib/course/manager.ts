import type {
	CourseCreate,
	Course,
	CourseId,
	CourseUpdate,
	ProfessorCreate,
	Professor,
	ProfessorId,
	ProfessorUpdate
} from './types.js';
import type { ManagerResult } from '../general/types.js';
import { CourseController, ProfessorController } from './controller.js';

export class CourseManager {
	static async createCourse(course: CourseCreate): Promise<ManagerResult<Course>> {
		return { ok: true, value: await CourseController.createCourse(course) };
	}

	static async getCourseById(id: CourseId): Promise<ManagerResult<Course | null>> {
		return { ok: true, value: await CourseController.getCourseById(id) };
	}

	static async getAllCourseArr(): Promise<ManagerResult<Course[]>> {
		return { ok: true, value: await CourseController.getAllCourses() };
	}

	static async getCourseArrByIdArr(
		idArr: CourseId[]
	): Promise<ManagerResult<Array<Course | null>>> {
		return { ok: true, value: await CourseController.getCoursesByIdArr(idArr) };
	}

	static async updateCourseById(
		id: CourseId,
		course: CourseUpdate
	): Promise<ManagerResult<Course | null>> {
		return { ok: true, value: await CourseController.updateCourseById(id, course) };
	}

	static async deleteCourseById(id: CourseId): Promise<ManagerResult<void>> {
		await CourseController.deleteCourseById(id);
		return { ok: true };
	}

	static async #createCourseIdMap<T extends { courseId: CourseId }>(arr: T[]) {
		const courseIdArr = arr.map((item) => item.courseId);
		const courseArr = await CourseController.getCoursesByIdArr(courseIdArr);
		const courseIdMap = new Map<string, Course>();

		for (const course of courseArr) {
			if (!course) continue;
			if (courseIdMap.has(course._id.toString())) continue;
			courseIdMap.set(course._id.toString(), course);
		}

		return courseIdMap;
	}

	static async fillCourseInfosByCourseId<T extends { courseId: CourseId }>(arr: T[]): Promise<T[]> {
		const courseIdMap = await this.#createCourseIdMap(arr);
		return arr.map((item) => {
			const course = courseIdMap.get(item.courseId.toString());
			return {
				...item,
				courseCode: course?.code ?? '???',
				courseName: course?.name ?? '???'
			};
		});
	}
}

export class ProfessorManager {
	static async createProfessor(professor: ProfessorCreate): Promise<ManagerResult<Professor>> {
		return { ok: true, value: await ProfessorController.createProfessor(professor) };
	}

	static async getProfessorById(id: ProfessorId): Promise<ManagerResult<Professor | null>> {
		return { ok: true, value: await ProfessorController.getProfessorById(id) };
	}

	static async getAllProfessorArr(): Promise<ManagerResult<Professor[]>> {
		return { ok: true, value: await ProfessorController.getAllProfessors() };
	}

	static async getProfessorArrByIdArr(
		idArr: ProfessorId[]
	): Promise<ManagerResult<Array<Professor | null>>> {
		return { ok: true, value: await ProfessorController.getProfessorsByIdArr(idArr) };
	}

	static async updateProfessorById(
		id: ProfessorId,
		professor: ProfessorUpdate
	): Promise<ManagerResult<Professor | null>> {
		return { ok: true, value: await ProfessorController.updateProfessorById(id, professor) };
	}

	static async deleteProfessorById(id: ProfessorId): Promise<ManagerResult<void>> {
		await ProfessorController.deleteProfessorById(id);
		return { ok: true };
	}

	static async #createProfessorIdMap<T extends { professorId: ProfessorId }>(arr: T[]) {
		const professorIdArr = arr.map((item) => item.professorId);
		const professorArr = await ProfessorController.getProfessorsByIdArr(professorIdArr);
		const professorIdMap = new Map<string, Professor>();

		for (const professor of professorArr) {
			if (!professor) continue;
			if (professorIdMap.has(professor._id.toString())) continue;
			professorIdMap.set(professor._id.toString(), professor);
		}

		return professorIdMap;
	}

	static async fillProfessorNamesByProfessorId<T extends { professorId: ProfessorId }>(
		arr: T[]
	): Promise<T[]> {
		const professorIdMap = await this.#createProfessorIdMap(arr);
		return arr.map((item) => {
			const professor = professorIdMap.get(item.professorId.toString());
			return {
				...item,
				professorName: professor?.name ?? '???'
			};
		});
	}
}
