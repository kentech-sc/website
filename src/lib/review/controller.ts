import type { Review, ReviewCreate, ReviewUpdate, ReviewId } from './types.js';
import type { CourseId, ProfessorId } from '$lib/course/types.js';
import ReviewModel from './model.js';
import type { UserId } from '$lib/user/types.js';

export default class ReviewController {
	static async createReview(review: ReviewCreate): Promise<Review> {
		const newReview = (await ReviewModel.create(review)).toObject();
		return newReview;
	}

	static async getReviewByReviewId(reviewId: ReviewId): Promise<Review | null> {
		return await ReviewModel.findOne({ _id: reviewId }).lean();
	}

	static async getAllReviews(): Promise<Review[]> {
		return await ReviewModel.find().sort({ createdAt: -1 }).lean();
	}

	static async getReviewsByCourseId(courseId: CourseId): Promise<Review[]> {
		return await ReviewModel.find({ courseId }).sort({ createdAt: -1 }).lean();
	}

	static async getReviewsByProfessorId(professorId: ProfessorId): Promise<Review[]> {
		return await ReviewModel.find({ professorId }).sort({ createdAt: -1 }).lean();
	}

	static async getReviewsByUserId(userId: UserId): Promise<Review[]> {
		return await ReviewModel.find({ userId }).sort({ createdAt: -1 }).lean();
	}

	static async getReviewsByCourseIdAndUserId(
		courseId: CourseId,
		userId: UserId
	): Promise<Review[]> {
		return await ReviewModel.find({ courseId, userId }).sort({ createdAt: -1 }).lean();
	}

	static async getReviewsByCourseIdAndProfessorId(
		courseId: CourseId,
		professorId: ProfessorId
	): Promise<Review[]> {
		return await ReviewModel.find({ courseId, professorId }).sort({ createdAt: -1 }).lean();
	}

	static async updateReviewByReviewId(
		reviewId: ReviewId,
		review: ReviewUpdate
	): Promise<Review | null> {
		const oldReview = await this.getReviewByReviewId(reviewId);
		if (!oldReview) return null;
		await this.deleteReviewByReviewId(reviewId);
		return await this.createReview({
			courseId: oldReview.courseId,
			professorId: oldReview.professorId,
			userId: oldReview.userId,
			score: review?.score ?? oldReview.score,
			comment: review?.comment ?? oldReview.comment
		});
	}

	static async deleteReviewByReviewId(reviewId: ReviewId): Promise<Review | null> {
		const deletedReview = await ReviewModel.findOneAndDelete({ _id: reviewId }).lean();
		if (!deletedReview) return null;
		return deletedReview;
	}

	static async deleteAllReviewsByCourseId(courseId: CourseId): Promise<void> {
		await ReviewModel.deleteMany({ courseId });
	}

	static async deleteAllReviewsByProfessorId(professorId: ProfessorId): Promise<void> {
		await ReviewModel.deleteMany({ professorId });
	}
}
