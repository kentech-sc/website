import CourseManager from '$lib/course/manager';
import ProfessorManager from '$lib/professor/manager';
import { fail } from '@sveltejs/kit';

// export const load = async () => {
// 	const courseArr = await CourseReviewManager.getCourseArr();
// 	return { courseArr: JSON.stringify(courseArr) };
// };

export const actions = {
	addCourse: async ({ request }) => {
		const formData = await request.formData();
		const code = (formData.get('code') ?? '').toString();
		const name = (formData.get('name') ?? '').toString();
		const content = (formData.get('content') ?? '').toString();

		if (!code || !name || !content)
			return fail(400, { message: 'code, name, content are required' });

		const course = await CourseManager.createCourse({ code, name, content });
		if (!course) return fail(400, { message: 'course creation failed' });
	},
	addProfessor: async ({ request }) => {
		const formData = await request.formData();
		const name = (formData.get('name') ?? '').toString();

		if (!name) return fail(400, { message: 'name is required' });

		const professor = await ProfessorManager.createProfessor({ name });
		if (!professor) return fail(400, { message: 'professor creation failed' });
	}
};
