import { fail, redirect } from '@sveltejs/kit';

import type { ReviewId } from '$lib/types/review.type.js';

import { withActionErrorHandling, withLoadErrorHandling } from '$lib/server/errors.js';
import * as ReviewUsecase from '$lib/usecase/review.usecase.js';

export const load = withLoadErrorHandling(async ({ params, locals }) => {
	const reviewIdRaw = params.reviewId;
	if (!reviewIdRaw) throw new Error('강의 평가 ID가 필요합니다.');
	const reviewId: ReviewId = reviewIdRaw;

	return await ReviewUsecase.getReviewEditData(reviewId, locals.user);
});

export const actions = {
	editReview: withActionErrorHandling(async ({ request, locals, params }) => {
		const reviewIdRaw = params.reviewId;
		if (!reviewIdRaw) return fail(400, { message: '강의 평가 ID가 필요합니다.' });
		const reviewId: ReviewId = reviewIdRaw;

		const formData = await request.formData();
		const offeringId = (formData.get('offeringId') ?? '').toString() || undefined;
		const title = (formData.get('title') ?? '').toString();
		const score = {
			assignment: Number(formData.get('assignmentScore')),
			lecture: Number(formData.get('lectureScore')),
			exam: Number(formData.get('examScore')),
			satisfaction: Number(formData.get('satisfactionScore'))
		};
		const comment = (formData.get('comment') ?? '').toString();

		if (!title || !comment) {
			return fail(400, { message: '제목, 점수, 내용은 필수입니다.' });
		}

		const review = await ReviewUsecase.editReview(
			reviewId,
			{
				offeringId,
				title,
				score,
				comment
			},
			locals.user
		);
		throw redirect(302, '/review/' + review.id);
	})
};
