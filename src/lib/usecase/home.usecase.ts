import * as AcademicCalendarUsecase from './academic-calendar.usecase.js';
import * as DiningUsecase from './dining.usecase.js';

import * as BannerService from '$lib/services/banner.service.js';
import * as FeedbackService from '$lib/services/feedback.service.js';
import * as PetitionService from '$lib/services/petition.service.js';
import * as PostService from '$lib/services/post.service.js';
import * as ReviewService from '$lib/services/review.service.js';

/**
 * 배너를 못 읽어도 홈은 떠야 한다.
 * (마이그레이션이 배포보다 늦으면 테이블이 없어 조회가 실패한다)
 */
async function findBannerOrNull() {
	try {
		return await BannerService.findActiveBanner();
	} catch {
		return null;
	}
}

export async function getHomeData() {
	const [reviews, feedback, noticePosts, petitions, dining, schedule, banner] = await Promise.all([
		ReviewService.getReviewPreviews(),
		FeedbackService.getFeedbackPreviews(),
		PostService.getPostPreviewsByBoardId('notice'),
		PetitionService.getPetitionPreviews(),
		// 학교 포털을 부르는 외부 호출이라 실패해도 홈은 떠야 한다.
		DiningUsecase.getDiningMenusOrNull(),
		AcademicCalendarUsecase.getScheduleOrNull(),
		findBannerOrNull()
	]);

	return {
		feedback,
		noticePosts,
		reviews,
		petitions,
		dining,
		schedule,
		banner
	};
}
