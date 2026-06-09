import { redirect } from '@sveltejs/kit';

import type { ReviewId } from '$lib/types/review.type.js';
import { withActionErrorHandling, withLoadErrorHandling } from '$lib/server/errors.js';
import * as ReviewUsecase from '$lib/usecase/review.usecase.js';

export const load = withLoadErrorHandling(async ({ params, locals }) => {
	const reviewIdRaw = params.reviewId;
	if (!reviewIdRaw) throw new Error('리뷰 ID가 필요합니다.');
	const reviewId: ReviewId = reviewIdRaw;

	return await ReviewUsecase.getReviewDetail(reviewId, locals.user);
});

export const actions = {
	deleteReview: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const reviewIdRaw = (formData.get('review-id') ?? '').toString();
		const reviewId: ReviewId = reviewIdRaw;

		await ReviewUsecase.deleteReview(reviewId, locals.user);
		throw redirect(302, '/review');
	})
};
