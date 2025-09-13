import ReviewService from '$lib/review/service.js';
import UserService from '$lib/user/service.js';
import PetitionService from '$lib/petition/service.js';
import BoardService from '$lib/board/service';
import ReviewApplication from '$lib/applications/review.js';

export const load = async () => {
	const reviewsResult = await ReviewService.getReviews();
	const reviewsRaw = reviewsResult.pageItems;
	const reviews = await ReviewApplication.fillReviews(reviewsRaw);

	const postsResult = await BoardService.getPostsByBoardId('main');
	const postsRaw = postsResult.pageItems;
	const posts = await UserService.fillDisplayNames(postsRaw);

	const petitionsResult = await PetitionService.getPetitions();
	const petitionsRaw = petitionsResult.pageItems;

	return {
		posts: JSON.stringify(posts),
		reviews: JSON.stringify(reviews),
		petitions: JSON.stringify(petitionsRaw)
	};
};
