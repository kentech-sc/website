import * as ReviewService from '$lib/srv/review.srv.js';
import * as UserService from '$lib/srv/user.srv.js';
import * as PetitionService from '$lib/srv/petition.srv.js';
import * as PostService from '$lib/srv/post.srv.js';
import * as ReviewApplication from '$lib/app/review.app.js';

export const load = async () => {
	const reviewsResult = await ReviewService.getReviews();
	const reviewsRaw = reviewsResult.pageItems;
	const reviews = await ReviewApplication.fillReviews(reviewsRaw);

	const freePostsResult = await PostService.getPostsByBoardId('free');
	const freePostsRaw = freePostsResult.pageItems;
	const freePosts = await UserService.fillDisplayNames(freePostsRaw);

	const noticePostsResult = await PostService.getPostsByBoardId('notice');
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
