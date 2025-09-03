import ReviewService from '$lib/review/service';
import ReviewApplication from '$lib/applications/review.js';

export const load = async () => {
	const reviewsRaw = await ReviewService.getAllReviews();
	const reviews = await ReviewApplication.fillReviews(reviewsRaw);
	return { reviews: JSON.stringify(reviews) };
};
