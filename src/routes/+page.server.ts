import ReviewManager from '$lib/review/manager';
import BoardManager from '$lib/board/manager';
import { error } from '@sveltejs/kit';

export const load = async () => {
	const review_res = await ReviewManager.getAllReviewArr();
	if (!review_res.ok) error(400, { message: review_res.error });
	const reviewArr = review_res.value;

	const post_res = await BoardManager.getPostsByBoardId('main');
	if (!post_res.ok) error(400, { message: post_res.error });
	const postArr = post_res.value;

	return { postArr: JSON.stringify(postArr), reviewArr: JSON.stringify(reviewArr) };
};
