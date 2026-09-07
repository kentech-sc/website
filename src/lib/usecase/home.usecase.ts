import * as AcademicCalendarUsecase from './academic-calendar.usecase.js';
import * as DiningUsecase from './dining.usecase.js';
import { attachPetitionNames, findPetitionUserMap } from './petition.usecase.js';
import { fillReviews } from './review.usecase.js';

import * as BannerService from '$lib/services/banner.service.js';
import * as PetitionService from '$lib/services/petition.service.js';
import * as PostService from '$lib/services/post.service.js';
import * as ReviewService from '$lib/services/review.service.js';
import * as UserService from '$lib/services/user.service.js';

/**
 * 배너를 못 읽어도 홈은 떠야 한다.
 * (마이그레이션이 배포보다 늦으면 테이블이 없어 조회가 실패한다)
 */
async function findBannerOrNull() {
	try {
		return await BannerService.findBanner();
	} catch {
		return null;
	}
}

export async function getHomeData() {
	const [
		reviewsResult,
		freePostsResult,
		noticePostsResult,
		petitionsResult,
		dining,
		schedule,
		banner
	] = await Promise.all([
		ReviewService.getReviewPage(5),
		PostService.getPostPageByBoardId('free', 5),
		PostService.getPostPageByBoardId('notice', 5),
		PetitionService.getPetitionPage(5),
		// 학교 포털을 부르는 외부 호출이라 실패해도 홈은 떠야 한다.
		DiningUsecase.getDiningMenusOrNull(),
		AcademicCalendarUsecase.getScheduleOrNull(),
		findBannerOrNull()
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
		petitions,
		dining,
		schedule,
		banner
	};
}
