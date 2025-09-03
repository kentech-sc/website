import ReviewService from '$lib/review/service';
import ReviewApplication from '$lib/applications/review.js';
import type { ReviewId } from '$lib/review/types';
import { redirect } from '@sveltejs/kit';
import { Types } from 'mongoose';

export const load = async ({ params }) => {
	const reviewIdRaw = params.reviewId;
	const reviewId = new Types.ObjectId(reviewIdRaw);

	const reviewRaw = await ReviewService.getReviewById(reviewId);

	const review = (await ReviewApplication.fillReviews([reviewRaw]))[0];

	return { review: JSON.stringify(review) };
};

export const actions = {
	deleteReview: async ({ request }) => {
		const formData = await request.formData();
		const reviewIdRaw = (formData.get('review-id') ?? '').toString();
		const reviewId: ReviewId = new Types.ObjectId(reviewIdRaw);

		await ReviewService.deleteReviewById(reviewId);
		redirect(302, '/review');
	}
};
