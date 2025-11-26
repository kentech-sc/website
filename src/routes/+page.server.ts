import ReviewService from '$lib/srv/review.srv.js';
import UserService from '$lib/srv/user.srv.js';
import PetitionService from '$lib/srv/petition.srv.js';
import BoardService from '$lib/srv/comment.srv';
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
