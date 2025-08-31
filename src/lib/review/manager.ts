import type { ReviewUpdate, ReviewId, Review, ReviewCreate } from './types.js';
import type { UserId } from '$lib/user/types.js';
import ReviewController from './controller.js';
import type { CourseId, ProfessorId } from '$lib/course/types.js';

export default class ReviewManager {
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
		return await ReviewController.createReview(review);
	}

	static async getReviewById(reviewId: ReviewId): Promise<Review> {
		const review = await ReviewController.getReviewById(reviewId);
		if (!review) throw new Error('존재하지 않는 리뷰입니다.');
		return review;
	}

	static async getAllReviews(): Promise<Review[]> {
		const reviews = await ReviewController.getAllReviews();
		if (!reviews) throw new Error('리뷰가 존재하지 않습니다.');
		return reviews;
	}

	static async getReviewByCourseId(courseId: CourseId): Promise<Review[]> {
		const reviews = await ReviewController.getReviewsByCourseId(courseId);
		if (!reviews) throw new Error('리뷰가 존재하지 않습니다.');
		return reviews;
	}

	static async getReviewByProfessorId(professorId: ProfessorId): Promise<Review[]> {
		const reviews = await ReviewController.getReviewsByProfessorId(professorId);
		if (!reviews) throw new Error('리뷰가 존재하지 않습니다.');
		return reviews;
	}

	static async getReviewByUserId(userId: UserId): Promise<Review[]> {
		const reviews = await ReviewController.getReviewsByUserId(userId);
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

		const updatedReview = await ReviewController.updateReviewById(reviewId, review);
		if (!updatedReview) throw new Error('존재하지 않는 리뷰입니다.');
		return updatedReview;
	}

	static async deleteReviewById(reviewId: ReviewId): Promise<void> {
		const deletedReview = await ReviewController.deleteReviewById(reviewId);
		if (!deletedReview) throw new Error('존재하지 않는 리뷰입니다.');
	}
}
