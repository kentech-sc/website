import * as ReviewApplication from '$lib/app/review.app.js';

import * as ReviewService from '$lib/srv/review.srv.js';

import type { ReviewId } from '$lib/types/review.type.js';

import { redirect } from '@sveltejs/kit';
import { Types } from 'mongoose';

import { withActionErrorHandling, withLoadErrorHandling } from '$lib/common/errors.js';

export const load = withLoadErrorHandling(async ({ params }) => {
	const reviewIdRaw = params.reviewId;
	const reviewId = new Types.ObjectId(reviewIdRaw);

	const reviewRaw = await ReviewService.getReviewById(reviewId);

	const review = (await ReviewApplication.fillReviews([reviewRaw]))[0];

	return { review: JSON.stringify(review) };
});

export const actions = {
	deleteReview: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const reviewIdRaw = (formData.get('review-id') ?? '').toString();
		const reviewId: ReviewId = new Types.ObjectId(reviewIdRaw);

		await ReviewService.deleteReviewById(reviewId, locals.user);
		redirect(302, '/review');
	})
};
