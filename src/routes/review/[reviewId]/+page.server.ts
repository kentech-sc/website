import ReviewManager from '$lib/review/manager';
import ReviewService from '$lib/review/service.js';
import type { ReviewId } from '$lib/review/types';
import { error, fail, redirect } from '@sveltejs/kit';
import { Types } from 'mongoose';

export const load = async ({ params }) => {
	const reviewIdRaw = params.reviewId;
	if (!reviewIdRaw || typeof reviewIdRaw !== 'string')
		error(400, { message: 'reviewId is undefined or invalid' });
	const reviewId = new Types.ObjectId(reviewIdRaw);

	const reviewRaw = await ReviewManager.getReviewById(reviewId);
	if (!reviewRaw) error(400, { message: 'review not found' });

	const review = (await ReviewService.fillReviews([reviewRaw]))[0];

	return { review: JSON.stringify(review) };
};

export const actions = {
	deleteReview: async ({ request }) => {
		const formData = await request.formData();
		const reviewIdRaw = formData.get('review-id');
		if (!reviewIdRaw || typeof reviewIdRaw !== 'string')
			return fail(400, { message: 'reviewId is undefined or invalid' });
		const reviewId: ReviewId = new Types.ObjectId(reviewIdRaw);

		await ReviewManager.deleteReviewById(reviewId);
		redirect(302, '/review');
	}
};
