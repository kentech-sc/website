import type { Review, ReviewCreate, ReviewUpdate, ReviewId } from './types.js';
import type { CourseId } from '$lib/course/types.js';
import type { ProfessorId } from '$lib/professor/types.js';
import ReviewModel from './model.js';
import type { UserId } from '$lib/user/types.js';
import { paginateModel } from '$lib/general/paginate';
import type { FilterQuery } from 'mongoose';

export default class ReviewRepository {
	static async createReview(review: ReviewCreate): Promise<Review> {
		return (await ReviewModel.create(review)).toObject();
	}

	static async getReviewById(reviewId: ReviewId): Promise<Review | null> {
		return await ReviewModel.findOne({ _id: reviewId }).lean();
	}

	static async getReviewsWithCondition(
		limit = 10,
		{
			professorId,
			courseId,
			fromId,
			toId
		}: { professorId?: ProfessorId; courseId?: CourseId; fromId?: ReviewId; toId?: ReviewId } = {}
	): Promise<{ pageItems: Review[]; fromId?: ReviewId; toId?: ReviewId }> {
		const filterQuery: FilterQuery<Review> = {};
		if (professorId) filterQuery.professorId = professorId;
		if (courseId) filterQuery.courseId = courseId;
		return await paginateModel(ReviewModel, filterQuery, limit, { fromId, toId });
	}

	static async getReviewsByUserId(
		userId: UserId,
		limit = 10,
		{ fromId, toId }: { fromId?: ReviewId; toId?: ReviewId } = {}
	): Promise<{ pageItems: Review[]; fromId?: ReviewId; toId?: ReviewId }> {
		return await paginateModel(ReviewModel, { userId }, limit, { fromId, toId });
	}

	static async updateReviewById(
		reviewId: ReviewId,
		reviewUpdate: ReviewUpdate
	): Promise<Review | null> {
		return await ReviewModel.findOneAndUpdate({ _id: reviewId }, reviewUpdate, {
			new: true
		}).lean();
	}

	static async deleteReviewById(reviewId: ReviewId): Promise<Review | null> {
		return await ReviewModel.findOneAndDelete({ _id: reviewId }).lean();
	}

	static async deleteAllReviewsByCourseId(courseId: CourseId): Promise<void> {
		await ReviewModel.deleteMany({ courseId });
	}

	static async deleteAllReviewsByProfessorId(professorId: ProfessorId): Promise<void> {
		await ReviewModel.deleteMany({ professorId });
	}
}
