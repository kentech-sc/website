import type { CourseCreate } from '$lib/types/course.type.js';
import type { ProfessorCreate } from '$lib/types/professor.type.js';
import type { User } from '$lib/types/user.type.js';

import * as CourseService from '$lib/services/course.service.js';
import * as ProfessorService from '$lib/services/professor.service.js';
import { hasCapability } from '$lib/shared/permission.js';

export function getCoursePagePermissions(user: User) {
	return {
		canManageCourse: hasCapability(user, 'course.manage'),
		canManageProfessor: hasCapability(user, 'professor.manage')
	};
}

export async function createCourse(course: CourseCreate, user: User) {
	return await CourseService.createCourse(course, user);
}

export async function createProfessor(professor: ProfessorCreate, user: User) {
	return await ProfessorService.createProfessor(professor, user);
}
