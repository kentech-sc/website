import type {
	ReviewUpdate,
	ReviewId,
	Review,
	ReviewCreate,
	ReviewDoc
} from '$lib/types/review.type.js';
import type { User, UserId } from '$lib/types/user.type.js';
import type { CourseId } from '$lib/types/course.type.js';
import type { ProfessorId } from '$lib/types/prof.type.js';

import * as ReviewRepository from '$lib/repo/review.repo.js';
import * as ReviewRule from '$lib/rules/review.rule.js';

import { RuleError, SrvError } from '$lib/common/errors.js';

export const translatedTerm: Record<number, string> = {
	1: '1',
	3: '여름',
	2: '2',
	4: '겨울'
};

function toReview(reviewDoc: ReviewDoc): Review {
	return {
		...reviewDoc,
		courseCode: null,
		courseName: null,
		professorName: null
	};
}

export async function createReview(
	courseId: CourseId,
	professorId: ProfessorId,
	userId: UserId,
	year: number,
	term: number,
	title: string,
	score: {
		assignment: number;
		lecture: number;
		exam: number;
	},
	comment: string
): Promise<Review> {
	if (!ReviewRule.checkReviewYearAndTerm(year, term))
		throw new RuleError('연도 또는 학기 값이 올바르지 않습니다.');
	if (!ReviewRule.checkReviewScore(score))
		throw new RuleError('점수는 1에서 10 사이의 값이어야 합니다.');
	const review: ReviewCreate = {
		courseId,
		professorId,
		userId,
		year,
		term,
		title,
		score,
		comment
	};
	return toReview(await ReviewRepository.createReview(review));
}

export async function getReviewById(reviewId: ReviewId): Promise<Review> {
	const review = await ReviewRepository.getReviewById(reviewId);
	if (!review) throw new SrvError('존재하지 않는 리뷰입니다.');
	return toReview(review);
}

export async function getReviews(
	limit = 10,
	{
		fromId,
		toId,
		courseId,
		professorId
	}: { fromId?: ReviewId; toId?: ReviewId; courseId?: CourseId; professorId?: ProfessorId } = {}
): Promise<{ pageItems: Review[]; fromId?: ReviewId; toId?: ReviewId }> {
	const reviews = await ReviewRepository.getReviewsWithCondition(limit, {
		fromId,
		toId,
		courseId,
		professorId
	});
	return { pageItems: reviews.pageItems.map(toReview), fromId: reviews.fromId, toId: reviews.toId };
}

export async function editReviewById(
	reviewId: ReviewId,
	reviewUpdate: ReviewUpdate,
	user: User
): Promise<Review> {
	const review = await getReviewById(reviewId);
	if (!ReviewRule.canEditOrDeleteReview(review, user))
		throw new RuleError('리뷰를 수정할 권한이 없습니다.');

	const updatedReview = await ReviewRepository.updateReviewById(reviewId, reviewUpdate);
	if (!updatedReview) throw new SrvError('존재하지 않는 리뷰입니다.');

	return toReview(updatedReview);
}

export async function deleteReviewById(reviewId: ReviewId, user: User): Promise<Review> {
	const review = await getReviewById(reviewId);
	if (!ReviewRule.canEditOrDeleteReview(review, user))
		throw new RuleError('리뷰를 삭제할 권한이 없습니다.');

	const isDeleted = await ReviewRepository.deleteReviewById(reviewId);
	if (!isDeleted) throw new SrvError('이미 삭제된 리뷰입니다.');

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
