import ReviewService from '$lib/srv/review.srv';
import ReviewApplication from '$lib/applications/review.js';
import type { ReviewId } from '$lib/types/review.type';
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
	deleteReview: async ({ request, locals }) => {
		const formData = await request.formData();
		const reviewIdRaw = (formData.get('review-id') ?? '').toString();
		const reviewId: ReviewId = new Types.ObjectId(reviewIdRaw);

		await ReviewService.deleteReviewById(reviewId, locals.user);
		redirect(302, '/review');
	}
};
