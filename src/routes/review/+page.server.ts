import ReviewManager from '$lib/review/manager';
import ReviewService from '$lib/review/service.js';

export const load = async () => {
	const reviewsRaw = await ReviewManager.getAllReviews();
	const reviews = await ReviewService.fillReviews(reviewsRaw);
	return { reviews: JSON.stringify(reviews) };
};
