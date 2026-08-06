import { fail, redirect } from '@sveltejs/kit';

import { withActionErrorHandling, withLoadErrorHandling } from '$lib/server/errors.js';
import * as ReviewUsecase from '$lib/usecase/review.usecase.js';

export const load = withLoadErrorHandling(async ({ locals }) => {
	return await ReviewUsecase.getReviewFormOptions(locals.user);
});

export const actions = {
	createReview: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();

		const offeringId = (formData.get('offeringId') ?? '').toString();
		const title = (formData.get('title') ?? '').toString();
		const score = {
			assignment: Number(formData.get('assignmentScore')),
			lecture: Number(formData.get('lectureScore')),
			exam: Number(formData.get('examScore')),
			satisfaction: Number(formData.get('satisfactionScore'))
		};
		const comment = (formData.get('comment') ?? '').toString();

		if (!offeringId || !title || !score) {
			return fail(400, { message: '수강한 개설강좌, 제목, 점수는 필수입니다.' });
		}

		const review = await ReviewUsecase.createReview(
			{
				offeringId,
				userId: locals.user.id,
				title,
				score,
				comment
			},
			locals.user
		);

		throw redirect(302, '/review/' + review.id);
	})
};
