import type { CourseId } from '$lib/types/course.type.js';
import type { ProfessorId } from '$lib/types/professor.type.js';
import type { Review, ReviewCreate, ReviewId, ReviewUpdate } from '$lib/types/review.type.js';
import type { User } from '$lib/types/user.type.js';

import { hasAnyCapability, hasCapability } from '$lib/shared/permission.js';

import * as CourseService from '$lib/services/course.service.js';
import * as ProfessorService from '$lib/services/professor.service.js';
import * as ReviewService from '$lib/services/review.service.js';

async function fillReviews(reviews: Review[]) {
	const withCourseInfo = await CourseService.attachCourseInfo(reviews);
	return await ProfessorService.attachProfessorInfo(withCourseInfo);
}

export async function getReviewFormOptions() {
	const [courses, professors] = await Promise.all([
		CourseService.findCourses(),
		ProfessorService.findProfessors()
	]);

	return { courses, professors };
}

export async function getReviewPageView(
	page: number,
	user: User,
	courseId?: CourseId,
	professorId?: ProfessorId
) {
	const limit = 10;
	const skip = (page - 1) * limit;
	const reviewsResult = await ReviewService.getReviewPage(limit, skip, professorId, courseId);

	return {
		reviews: await fillReviews(reviewsResult.items),
		hasPrev: reviewsResult.hasPrev,
		hasNext: reviewsResult.hasNext,
		canCreateReview: hasCapability(user, 'review.write'),
		canManageCatalog: hasAnyCapability(user, ['course.manage', 'professor.manage'])
	};
}

export async function getReviewDetail(reviewId: ReviewId, user: User) {
	const reviewRaw = await ReviewService.getReviewById(reviewId);
	const review = (await fillReviews([reviewRaw]))[0];

	return {
		review,
		permissions: ReviewService.getReviewPermissions(review, user)
	};
}

export async function getReviewEditData(reviewId: ReviewId, user: User) {
	const [formOptions, detail] = await Promise.all([
		getReviewFormOptions(),
		getReviewDetail(reviewId, user)
	]);

	return {
		...formOptions,
		review: detail.review,
		permissions: detail.permissions
	};
}

export async function createReview(reviewCreate: ReviewCreate, user: User) {
	return await ReviewService.createReview(reviewCreate, user);
}

export async function editReview(reviewId: ReviewId, reviewUpdate: ReviewUpdate, user: User) {
	return await ReviewService.editReviewById(reviewId, reviewUpdate, user);
}

export async function deleteReview(reviewId: ReviewId, user: User) {
	return await ReviewService.deleteReviewById(reviewId, user);
}
