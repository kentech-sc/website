import ReviewManager from '$lib/review/manager';
import { error } from '@sveltejs/kit';

export const load = async () => {
	const review_res = await ReviewManager.getAllReviewArr();
	if (!review_res.ok) error(400, { message: review_res.error });
	const reviewArr = review_res.value;
	return { reviewArr: JSON.stringify(reviewArr) };
};
