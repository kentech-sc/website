import type { CourseId } from '$lib/types/course.type.js';
import type { Page } from '$lib/types/general.type.js';
import type { ProfessorId } from '$lib/types/professor.type.js';
import type { ReviewCreate, ReviewEntity, ReviewId, ReviewUpdate } from '$lib/types/review.type.js';
import type { User } from '$lib/types/user.type.js';

import * as AcademicRepository from '$lib/repositories/academic.repository.js';
import * as ReviewRepository from '$lib/repositories/review.repository.js';
import * as ReviewRule from '$lib/rules/review.rule.js';
import { AppError, assertRule } from '$lib/server/errors.js';
import { assertUuid } from '$lib/server/id.js';
import { createPage } from '$lib/shared/paginate.js';
import { hasCapability } from '$lib/shared/permission.js';
import { APP_ERROR } from '$lib/shared/rule.js';

export function getReviewPermissions(review: ReviewEntity, user: User) {
	return {
		canEdit: ReviewRule.canEditOrDeleteReview(review, user).ok,
		canDelete: ReviewRule.canEditOrDeleteReview(review, user).ok,
		canLinkOffering: !review.offeringId && hasCapability(user, 'review.moderate')
	};
}

export async function createReview(reviewCreate: ReviewCreate, user: User): Promise<ReviewEntity> {
	assertRule(ReviewRule.canCreateReview(user));
	const offering = await AcademicRepository.findOffering(reviewCreate.offeringId);
	if (await ReviewRepository.findReviewByUserAndOffering(user.id, reviewCreate.offeringId))
		throw new AppError(APP_ERROR.CONFLICT, '이미 평가한 강의입니다.');
	if (!offering) throw new AppError(APP_ERROR.NOT_FOUND, '개설 강좌를 찾을 수 없습니다.');
	assertRule(ReviewRule.validateReviewYearAndTerm(offering.year, offering.term));
	assertRule(ReviewRule.validateReviewScore(reviewCreate.score));
	return await ReviewRepository.createReview(reviewCreate);
}

export async function getReviewById(reviewId: ReviewId): Promise<ReviewEntity> {
	assertUuid(reviewId, '존재하지 않는 강의 평가입니다.');
	const review = await ReviewRepository.findReviewById(reviewId);
	if (!review) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 강의 평가입니다.');
	return review;
}

export async function getReviewPage(
	limit = 10,
	skip = 0,
	professorId?: ProfessorId,
	courseId?: CourseId
): Promise<Page<ReviewEntity>> {
	const [result, totalCount] = await Promise.all([
		ReviewRepository.findRecentReviews(limit, skip, professorId, courseId),
		ReviewRepository.countReviews(professorId, courseId)
	]);
	return createPage<ReviewEntity>(result, totalCount, limit, skip);
}

export async function editReviewById(
	reviewId: ReviewId,
	reviewUpdate: ReviewUpdate,
	user: User
): Promise<ReviewEntity> {
	const review = await getReviewById(reviewId);
	assertRule(ReviewRule.canEditOrDeleteReview(review, user));

	if (reviewUpdate.score !== undefined) {
		assertRule(ReviewRule.validateReviewScore(reviewUpdate.score));
	}
	if (reviewUpdate.offeringId) {
		if (review.offeringId || !hasCapability(user, 'review.moderate'))
			throw new AppError(APP_ERROR.FORBIDDEN, '기존 강의평 연결 권한이 없습니다.');
		const offering = await AcademicRepository.findOffering(reviewUpdate.offeringId);
		const duplicate = await ReviewRepository.findReviewByUserAndOffering(
			review.userId,
			reviewUpdate.offeringId
		);
		if (duplicate && duplicate.id !== review.id)
			throw new AppError(APP_ERROR.CONFLICT, '이미 이 개설 강의에 작성한 평가가 있습니다.');
		if (!offering) throw new AppError(APP_ERROR.NOT_FOUND, '개설 강좌를 찾을 수 없습니다.');
		await ReviewRepository.linkReviewOffering(reviewId, offering.id);
	}
	reviewUpdate = {
		title: reviewUpdate.title,
		score: reviewUpdate.score,
		comment: reviewUpdate.comment
	};

	const updatedReview = await ReviewRepository.updateReviewById(reviewId, reviewUpdate);
	if (!updatedReview) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 강의 평가입니다.');

	return updatedReview;
}

export async function deleteReviewById(reviewId: ReviewId, user: User): Promise<ReviewEntity> {
	const review = await getReviewById(reviewId);
	assertRule(ReviewRule.canEditOrDeleteReview(review, user));

	const isDeleted = await ReviewRepository.deleteReviewById(reviewId);
	if (!isDeleted) throw new AppError(APP_ERROR.NOT_FOUND, '이미 삭제된 강의 평가입니다.');

	return review;
}

export async function searchReviewsByQuery(
	query: string,
	limit = 10,
	skip = 0
): Promise<Array<ReviewEntity & { searchScore?: number }>> {
	return await ReviewRepository.searchReviewsByQuery(query, limit, skip);
}

export async function countReviewsByQuery(query: string): Promise<number> {
	return await ReviewRepository.countReviewsByQuery(query);
}
