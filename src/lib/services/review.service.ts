import type { CourseId } from '$lib/types/course.type.js';
import type { Page } from '$lib/types/general.type.js';
import type { ProfessorId } from '$lib/types/professor.type.js';
import type {
	Review,
	ReviewCreate,
	ReviewEntity,
	ReviewId,
	ReviewUpdate
} from '$lib/types/review.type.js';
import type { User } from '$lib/types/user.type.js';

import { createPage } from '$lib/shared/paginate.js';
import { APP_ERROR } from '$lib/shared/rule.js';
import { AppError, assertRule } from '$lib/server/errors.js';

import * as ReviewRepository from '$lib/repositories/review.repository.js';
import * as ReviewRule from '$lib/rules/review.rule.js';

function toReview(reviewEntity: ReviewEntity): Review {
	return {
		...reviewEntity,
		courseName: null,
		professorName: null
	};
}

export function getReviewPermissions(review: Review, user: User) {
	return {
		canEdit: ReviewRule.canEditOrDeleteReview(review, user).ok,
		canDelete: ReviewRule.canEditOrDeleteReview(review, user).ok
	};
}

export async function createReview(reviewCreate: ReviewCreate, user: User): Promise<Review> {
	assertRule(ReviewRule.canCreateReview(user));
	assertRule(ReviewRule.validateReviewYearAndTerm(reviewCreate.year, reviewCreate.term));
	assertRule(ReviewRule.validateReviewScore(reviewCreate.score));
	return toReview(await ReviewRepository.createReview(reviewCreate));
}

export async function getReviewById(reviewId: ReviewId): Promise<Review> {
	const review = await ReviewRepository.findReviewById(reviewId);
	if (!review) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 리뷰입니다.');
	return toReview(review);
}

export async function getReviewPage(
	limit = 10,
	skip = 0,
	professorId?: ProfessorId,
	courseId?: CourseId
): Promise<Page<Review>> {
	const [result, totalCount] = await Promise.all([
		ReviewRepository.findRecentReviews(limit, skip, professorId, courseId),
		ReviewRepository.countReviews(professorId, courseId)
	]);
	return createPage<Review>(result.map(toReview), totalCount, limit, skip);
}

export async function editReviewById(
	reviewId: ReviewId,
	reviewUpdate: ReviewUpdate,
	user: User
): Promise<Review> {
	const review = await getReviewById(reviewId);
	assertRule(ReviewRule.canEditOrDeleteReview(review, user));

	if (reviewUpdate.year !== undefined && reviewUpdate.term !== undefined) {
		assertRule(ReviewRule.validateReviewYearAndTerm(reviewUpdate.year, reviewUpdate.term));
	}
	if (reviewUpdate.score !== undefined) {
		assertRule(ReviewRule.validateReviewScore(reviewUpdate.score));
	}

	const updatedReview = await ReviewRepository.updateReviewById(reviewId, reviewUpdate);
	if (!updatedReview) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 리뷰입니다.');

	return toReview(updatedReview);
}

export async function deleteReviewById(reviewId: ReviewId, user: User): Promise<Review> {
	const review = await getReviewById(reviewId);
	assertRule(ReviewRule.canEditOrDeleteReview(review, user));

	const isDeleted = await ReviewRepository.deleteReviewById(reviewId);
	if (!isDeleted) throw new AppError(APP_ERROR.NOT_FOUND, '이미 삭제된 리뷰입니다.');

	return toReview(review);
}

export async function searchReviewsByQuery(
	query: string,
	page = 1,
	limit = 10
): Promise<{ items: Review[]; more: boolean }> {
	const reviews = await ReviewRepository.searchReviewsByQuery(query, page, limit);
	return { items: reviews.items.map(toReview), more: reviews.more };
}
