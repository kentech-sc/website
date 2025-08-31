import ReviewManager from '$lib/review/manager';
import BoardManager from '$lib/board/manager';
import ReviewService from '$lib/review/service.js';
import UserManager from '$lib/user/manager';

export const load = async () => {
	const reviewsRaw = await ReviewManager.getAllReviews();
	const reviews = await ReviewService.fillReviews(reviewsRaw);

	const postsRaw = await BoardManager.getPostsByBoardId('main');
	const posts = await UserManager.fillDisplayNames(postsRaw);

	return { posts: JSON.stringify(posts), reviews: JSON.stringify(reviews) };
};
