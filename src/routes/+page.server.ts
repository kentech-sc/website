import ReviewService from '$lib/review/service.js';
import UserService from '$lib/user/service.js';
import PetitionService from '$lib/petition/service.js';
import BoardService from '$lib/board/service';
import ReviewApplication from '$lib/applications/review.js';

export const load = async () => {
	const reviewsRaw = await ReviewService.getAllReviews();
	const reviews = await ReviewApplication.fillReviews(reviewsRaw);

	const postsRaw = await BoardService.getPostsByBoardId('main');
	const posts = await UserService.fillDisplayNames(postsRaw);

	const petitionsRaw = await PetitionService.getAllPetitions();

	return {
		posts: JSON.stringify(posts),
		reviews: JSON.stringify(reviews),
		petitions: JSON.stringify(petitionsRaw)
	};
};
