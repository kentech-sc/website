import type { Petition } from '$lib/types/petition.type.js';
import { DisplayType, type UserId } from '$lib/types/user.type.js';

import { createDisplayName } from '$lib/shared/utils.js';

import * as CourseService from '$lib/services/course.service.js';
import * as PetitionService from '$lib/services/petition.service.js';
import * as PostService from '$lib/services/post.service.js';
import * as ProfessorService from '$lib/services/professor.service.js';
import * as ReviewService from '$lib/services/review.service.js';
import * as UserService from '$lib/services/user.service.js';

async function fillReviewsForHome(reviews: Awaited<ReturnType<typeof ReviewService.getReviewPage>>['items']) {
	const withCourseInfo = await CourseService.attachCourseInfo(reviews);
	return await ProfessorService.attachProfessorInfo(withCourseInfo);
}

async function fillPetitionsForHome(petitions: Petition[]): Promise<Petition[]> {
	const petitionerIds = petitions.map((petition) => petition.petitionerId);
	const responderIds = petitions
		.filter((petition) => petition.responderId !== null)
		.map((petition) => petition.responderId as UserId);

	const [petitioners, responders] = await Promise.all([
		UserService.findUsersByIds(petitionerIds),
		UserService.findUsersByIds(responderIds)
	]);

	const petitionerByUserId = new Map(
		petitionerIds.map((id, index) => [id.toString(), petitioners[index]])
	);
	const responderByUserId = new Map(
		responderIds.map((id, index) => [id.toString(), responders[index]])
	);

	return petitions.map((petition) => {
		const petitioner = petitionerByUserId.get(petition.petitionerId.toString());
		const responder = responderByUserId.get((petition.responderId ?? '').toString());

		return {
			...petition,
			petitionerName: petitioner ? createDisplayName(petitioner, DisplayType.RealName) : null,
			responderName: responder ? createDisplayName(responder, DisplayType.RealName) : null
		};
	});
}

export async function getHomeData() {
	const reviewsResult = await ReviewService.getReviewPage();
	const reviews = await fillReviewsForHome(reviewsResult.items);

	const freePostsResult = await PostService.getPostPageByBoardId('free');
	const freePosts = await UserService.fillDisplayNames(freePostsResult.items);

	const noticePostsResult = await PostService.getPostPageByBoardId('notice');
	const noticePosts = await UserService.fillDisplayNames(noticePostsResult.items);

	const petitionsResult = await PetitionService.getPetitionPage();
	const petitions = await fillPetitionsForHome(petitionsResult.items);

	return {
		freePosts,
		noticePosts,
		reviews,
		petitions
	};
}
