import { fail, redirect } from '@sveltejs/kit';

import type { CourseId } from '$lib/types/course.type.js';
import type { ProfessorId } from '$lib/types/professor.type.js';
import { withActionErrorHandling, withLoadErrorHandling } from '$lib/server/errors.js';
import * as ReviewUsecase from '$lib/usecase/review.usecase.js';

export const load = withLoadErrorHandling(async () => {
	return await ReviewUsecase.getReviewFormOptions();
});

export const actions = {
	createReview: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();

		const courseIdRaw = (formData.get('courseId') ?? '').toString();
		const professorIdRaw = (formData.get('professorId') ?? '').toString();
		const year = Number(formData.get('year'));
		const term = Number(formData.get('term'));
		const title = (formData.get('title') ?? '').toString();
		const score = {
			assignment: Number(formData.get('assignmentScore')),
			lecture: Number(formData.get('lectureScore')),
			exam: Number(formData.get('examScore')),
			satisfaction: Number(formData.get('satisfactionScore'))
		};
		const comment = (formData.get('comment') ?? '').toString();

		if (!courseIdRaw || !professorIdRaw || !year || !term || !title || !score) {
			return fail(400, { message: '강의, 교수, 연도, 학기, 제목, 점수는 필수입니다.' });
		}

		const review = await ReviewUsecase.createReview(
			{
				courseId: courseIdRaw as CourseId,
				professorId: professorIdRaw as ProfessorId,
				userId: locals.user._id,
				year,
				term,
				title,
				score,
				comment
			},
			locals.user
		);

		throw redirect(302, '/review/' + review._id);
	})
};
