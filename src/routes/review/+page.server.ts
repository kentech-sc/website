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

	const buildHref = (targetPage: number) => {
		const params = new URLSearchParams();
		if (courseId) params.set('course', courseId);
		if (professorId) params.set('professor', professorId);
		if (targetPage > 1) params.set('page', String(targetPage));
		const query = params.toString();
		return query ? `/review?${query}` : '/review';
	};

	return {
		reviews: reviewsResult.reviews,
		prevHref: reviewsResult.hasPrev ? buildHref(page - 1) : undefined,
		nextHref: reviewsResult.hasNext ? buildHref(page + 1) : undefined,
		courses,
		professors,
		courseId,
		professorId,
		canCreateReview: reviewsResult.canCreateReview,
		canManageCatalog: reviewsResult.canManageCatalog
	};
});
