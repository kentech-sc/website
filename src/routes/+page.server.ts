import ReviewService from '$lib/review/service.js';
import UserService from '$lib/user/service.js';
import PetitionService from '$lib/petition/service.js';
import BoardService from '$lib/board/service';
import ReviewApplication from '$lib/applications/review.js';

export const load = async () => {
	const reviewsResult = await ReviewService.getReviews();
	const reviewsRaw = reviewsResult.pageItems;
	const reviews = await ReviewApplication.fillReviews(reviewsRaw);

	const freePostsResult = await BoardService.getPostsByBoardId('free');
	const freePostsRaw = freePostsResult.pageItems;
	const freePosts = await UserService.fillDisplayNames(freePostsRaw);

	const noticePostsResult = await BoardService.getPostsByBoardId('notice');
	const noticePostsRaw = noticePostsResult.pageItems;
	const noticePosts = await UserService.fillDisplayNames(noticePostsRaw);

	const petitionsResult = await PetitionService.getPetitions();
	const petitionsRaw = petitionsResult.pageItems;

	return {
		freePosts: JSON.stringify(freePosts),
		noticePosts: JSON.stringify(noticePosts),
		reviews: JSON.stringify(reviews),
		petitions: JSON.stringify(petitionsRaw)
	};
};
