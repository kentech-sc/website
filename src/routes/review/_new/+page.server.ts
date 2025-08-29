import { CourseManager, ProfessorManager } from '$lib/course/manager';
import { fail, redirect } from '@sveltejs/kit';

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

		const course_res = await CourseManager.createCourse({ code, name, content });
		if (!course_res.ok) return fail(400, { message: course_res.error });
	},
	addProfessor: async ({ request }) => {
		const formData = await request.formData();
		const name = (formData.get('name') ?? '').toString();

		if (!name) return fail(400, { message: 'name is required' });

		const professor_res = await ProfessorManager.createProfessor({ name });
		if (!professor_res.ok) return fail(400, { message: professor_res.error });
	}
};
