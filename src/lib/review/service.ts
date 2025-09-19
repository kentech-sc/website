import type { ReviewUpdate, ReviewId, Review, ReviewCreate } from './types.js';
import type { UserId } from '$lib/user/types.js';
import ReviewRepository from './repository.js';
import type { CourseId } from '$lib/course/types.js';
import type { ProfessorId } from '$lib/professor/types.js';
import type { User } from '$lib/user/types.js';

export default class ReviewService {
	static translatedTerm: Record<number, string> = {
		1: '1',
		3: '여름',
		2: '2',
		4: '겨울'
	};

	static checkReviewYearAndTerm(year: number, term: number): boolean {
		const years = Array.from({ length: new Date().getFullYear() - 2021 }, (_, i) => 22 + i);
		if (years.indexOf(year) === -1 || term < 1 || term > 4) return false;
		return true;
	}

	static checkReviewScore(score: { assignment: number; lecture: number; exam: number }): boolean {
		for (const key in score) {
			if (score[key as keyof typeof score] < 1 || score[key as keyof typeof score] > 10)
				return false;
		}
		return true;
	}

	static async createReview(
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
		if (!this.checkReviewYearAndTerm(year, term))
			throw new Error('연도 또는 학기 값이 올바르지 않습니다.');
		if (!this.checkReviewScore(score)) throw new Error('점수는 1에서 10 사이의 값이어야 합니다.');
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

	static async getReviewById(reviewId: ReviewId): Promise<Review> {
		const review = await ReviewRepository.getReviewById(reviewId);
		if (!review) throw new Error('존재하지 않는 리뷰입니다.');
		return review;
	}

	static async getReviews(
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

	static async getReviewsByUserId(
		userId: UserId,
		limit = 10,
		{ fromId, toId }: { fromId?: ReviewId; toId?: ReviewId } = {}
	): Promise<{ pageItems: Review[]; fromId?: ReviewId; toId?: ReviewId }> {
		const reviews = await ReviewRepository.getReviewsByUserId(userId, limit, { fromId, toId });
		return reviews;
	}

	static #canEditOrDeleteReview(review: Review, user: User): boolean {
		return review.userId.equals(user._id) || user.group === 'manager';
	}

	static async editReviewById(
		reviewId: ReviewId,
		reviewUpdate: ReviewUpdate,
		user: User
	): Promise<Review> {
		const review = await this.getReviewById(reviewId);
		if (!this.#canEditOrDeleteReview(review, user))
			throw new Error('리뷰를 수정할 권한이 없습니다.');
		const updatedReview = await ReviewRepository.updateReviewById(reviewId, reviewUpdate);
		if (!updatedReview) throw new Error('존재하지 않는 리뷰입니다.');
		return updatedReview;
	}

	static async deleteReviewById(reviewId: ReviewId, user: User): Promise<Review> {
		const review = await this.getReviewById(reviewId);
		if (!this.#canEditOrDeleteReview(review, user))
			throw new Error('리뷰를 삭제할 권한이 없습니다.');
		const deletedReview = await ReviewRepository.deleteReviewById(reviewId);
		if (!deletedReview) throw new Error('존재하지 않는 리뷰입니다.');
		return deletedReview;
	}
}
