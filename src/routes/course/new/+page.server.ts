import { fail } from '@sveltejs/kit';

import { withActionErrorHandling, withLoadErrorHandling } from '$lib/server/errors.js';
import * as CourseUsecase from '$lib/usecase/course.usecase.js';

export const load = withLoadErrorHandling(async ({ locals }) => {
	return {
		permissions: CourseUsecase.getCoursePagePermissions(locals.user)
	};
});

export const actions = {
	addCourse: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const courseId = (formData.get('courseId') ?? '').toString();
		const name = (formData.get('name') ?? '').toString();
		const content = (formData.get('content') ?? '').toString();

		if (!courseId || !name || !content) {
			return fail(400, { message: '강의 ID, 이름, 설명은 필수입니다.' });
		}

		await CourseUsecase.createCourse({ _id: courseId, name, content }, locals.user);
		return { success: true };
	}),
	addProfessor: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const name = (formData.get('name') ?? '').toString();

		if (!name) return fail(400, { message: '이름은 필수입니다.' });

		await CourseUsecase.createProfessor({ name }, locals.user);
		return { success: true };
	})
};
