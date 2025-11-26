import type { ReviewUpdate, ReviewId, Review, ReviewCreate } from '$lib/types/review.type.js';
import type { User, UserId } from '$lib/types/user.type.js';
import type { CourseId } from '$lib/types/course.type.js';
import type { ProfessorId } from '$lib/types/prof.type.js';

import { UserGroup } from '$lib/types/user.type.js';

import * as ReviewRepository from '$lib/repo/review.repo.js';

export const translatedTerm: Record<number, string> = {
	1: '1',
	3: '여름',
	2: '2',
	4: '겨울'
};

export function checkReviewYearAndTerm(year: number, term: number): boolean {
	const years = Array.from({ length: new Date().getFullYear() - 2021 }, (_, i) => 22 + i);
	if (years.indexOf(year) === -1 || term < 1 || term > 4) return false;
	return true;
}

export function checkReviewScore(score: {
	assignment: number;
	lecture: number;
	exam: number;
}): boolean {
	for (const key in score) {
		if (score[key as keyof typeof score] < 1 || score[key as keyof typeof score] > 10) return false;
	}
	return true;
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
	if (!checkReviewYearAndTerm(year, term))
		throw new Error('연도 또는 학기 값이 올바르지 않습니다.');
	if (!checkReviewScore(score)) throw new Error('점수는 1에서 10 사이의 값이어야 합니다.');
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
	return await ReviewRepository.createReview(review);
}

export async function getReviewById(reviewId: ReviewId): Promise<Review> {
	const review = await ReviewRepository.getReviewById(reviewId);
	if (!review) throw new Error('존재하지 않는 리뷰입니다.');
	return review;
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
	return reviews;
}

export async function getReviewsByUserId(
	userId: UserId,
	limit = 10,
	{ fromId, toId }: { fromId?: ReviewId; toId?: ReviewId } = {}
): Promise<{ pageItems: Review[]; fromId?: ReviewId; toId?: ReviewId }> {
	const reviews = await ReviewRepository.getReviewsByUserId(userId, limit, { fromId, toId });
	return reviews;
}

export function canEditOrDeleteReview(review: Review, user: User): boolean {
	return review.userId.equals(user._id) || user.group === UserGroup.Manager;
}

export async function editReviewById(
	reviewId: ReviewId,
	reviewUpdate: ReviewUpdate,
	user: User
): Promise<Review> {
	const review = await getReviewById(reviewId);
	if (!canEditOrDeleteReview(review, user)) throw new Error('리뷰를 수정할 권한이 없습니다.');
	const updatedReview = await ReviewRepository.updateReviewById(reviewId, reviewUpdate);
	if (!updatedReview) throw new Error('존재하지 않는 리뷰입니다.');
	return updatedReview;
}

export async function deleteReviewById(reviewId: ReviewId, user: User): Promise<Review> {
	const review = await getReviewById(reviewId);
	if (!canEditOrDeleteReview(review, user)) throw new Error('리뷰를 삭제할 권한이 없습니다.');
	const deletedReview = await ReviewRepository.deleteReviewById(reviewId);
	if (!deletedReview) throw new Error('존재하지 않는 리뷰입니다.');
	return deletedReview;
}

export async function searchReviewByQuery(
	query: string,
	page = 1,
	limit = 10
): Promise<{ items: Review[]; more: boolean }> {
	const reviews = await ReviewRepository.searchReviewByQuery(query, page, limit);
	return { items: reviews.slice(0, limit), more: reviews.length > limit };
}
