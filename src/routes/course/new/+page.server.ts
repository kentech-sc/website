import CourseService from '$lib/course/service';
import ProfessorService from '$lib/professor/service';
import { fail } from '@sveltejs/kit';

export const actions = {
	addCourse: async ({ request, locals }) => {
		const formData = await request.formData();
		const code = (formData.get('code') ?? '').toString();
		const name = (formData.get('name') ?? '').toString();
		const content = (formData.get('content') ?? '').toString();

		if (!code || !name || !content)
			return fail(400, { message: 'code, name, content are required' });

		const course = await CourseService.createCourse({ code, name, content }, locals.user);
		if (!course) return fail(400, { message: 'course creation failed' });

		return { success: true };
	},
	addProfessor: async ({ request, locals }) => {
		const formData = await request.formData();
		const name = (formData.get('name') ?? '').toString();

		if (!name) return fail(400, { message: 'name is required' });

		const professor = await ProfessorService.createProfessor({ name }, locals.user);
		if (!professor) return fail(400, { message: 'professor creation failed' });

		return { success: true };
	}
};
