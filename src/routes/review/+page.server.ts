import { withLoadErrorHandling } from '$lib/server/errors.js';
import * as ReviewUsecase from '$lib/usecase/review.usecase.js';

export const load = withLoadErrorHandling(async ({ url, locals }) => {
	const courseIdRaw = url.searchParams.get('course');
	const courseId = courseIdRaw ?? undefined;

	const professorIdRaw = url.searchParams.get('professor');
	const professorId = professorIdRaw ?? undefined;

	const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);
	const reviewsResult = await ReviewUsecase.getReviewPageView(
		page,
		locals.user,
		courseId,
		professorId
	);
	const { courses, professors } = await ReviewUsecase.getReviewFormOptions();

	return {
		reviews: reviewsResult.reviews,
		currentPage: reviewsResult.currentPage,
		totalPages: reviewsResult.totalPages,
		courses,
		professors,
		courseId,
		professorId,
		canCreateReview: reviewsResult.canCreateReview,
		canManageCatalog: reviewsResult.canManageCatalog
	};
});
