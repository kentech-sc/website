import type { ReviewUpdate, ReviewId, Review, ReviewCreate } from './types.js';
import type { UserId } from '$lib/user/types.js';
import ReviewRepository from './repository.js';
import type { CourseId } from '$lib/course/types.js';
import type { ProfessorId } from '$lib/professor/types.js';

export default class ReviewService {
	static async createReview(
		courseId: CourseId,
		professorId: ProfessorId,
		userId: UserId,
		score: number,
		comment: string
	): Promise<Review> {
		const review: ReviewCreate = {
			courseId,
			professorId,
			userId,
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

	static async getAllReviews(): Promise<Review[]> {
		const reviews = await ReviewRepository.getAllReviews();
		return reviews;
	}

	static async getReviewByCourseId(courseId: CourseId): Promise<Review[]> {
		const reviews = await ReviewRepository.getReviewsByCourseId(courseId);
		if (!reviews) throw new Error('리뷰가 존재하지 않습니다.');
		return reviews;
	}

	static async getReviewByProfessorId(professorId: ProfessorId): Promise<Review[]> {
		const reviews = await ReviewRepository.getReviewsByProfessorId(professorId);
		if (!reviews) throw new Error('리뷰가 존재하지 않습니다.');
		return reviews;
	}

	static async getReviewByUserId(userId: UserId): Promise<Review[]> {
		const reviews = await ReviewRepository.getReviewsByUserId(userId);
		if (!reviews) throw new Error('리뷰가 존재하지 않습니다.');
		return reviews;
	}

	static async updateReviewById(
		reviewId: ReviewId,
		score: number,
		comment: string
	): Promise<Review> {
		const review: ReviewUpdate = {
			score,
			comment
		};

		const updatedReview = await ReviewRepository.updateReviewById(reviewId, review);
		if (!updatedReview) throw new Error('존재하지 않는 리뷰입니다.');
		return updatedReview;
	}

	static async deleteReviewById(reviewId: ReviewId): Promise<void> {
		const deletedReview = await ReviewRepository.deleteReviewById(reviewId);
		if (!deletedReview) throw new Error('존재하지 않는 리뷰입니다.');
	}
}
