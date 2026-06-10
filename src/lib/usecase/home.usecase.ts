import { attachPetitionNames, findPetitionUserMap } from './petition.usecase.js';
import { fillReviews } from './review.usecase.js';

import * as PetitionService from '$lib/services/petition.service.js';
import * as PostService from '$lib/services/post.service.js';
import * as ReviewService from '$lib/services/review.service.js';
import * as UserService from '$lib/services/user.service.js';

export async function getHomeData() {
	const [reviewsResult, freePostsResult, noticePostsResult, petitionsResult] = await Promise.all([
		ReviewService.getReviewPage(),
		PostService.getPostPageByBoardId('free'),
		PostService.getPostPageByBoardId('notice'),
		PetitionService.getPetitionPage()
	]);

	const [postUserMap, petitionUserMap, reviews] = await Promise.all([
		UserService.findUserMapByIds([
			...freePostsResult.items.map((post) => post.userId),
			...noticePostsResult.items.map((post) => post.userId)
		]),
		findPetitionUserMap(petitionsResult.items),
		fillReviews(reviewsResult.items)
	]);

	const freePosts = UserService.attachDisplayNames(freePostsResult.items, postUserMap);
	const noticePosts = UserService.attachDisplayNames(noticePostsResult.items, postUserMap);
	const petitions = attachPetitionNames(petitionsResult.items, petitionUserMap);

	return {
		freePosts,
		noticePosts,
		reviews,
		petitions
	};
}
