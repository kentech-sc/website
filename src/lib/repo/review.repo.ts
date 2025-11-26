import type { FilterQuery } from 'mongoose';

import type { Review, ReviewCreate, ReviewUpdate, ReviewId } from '$lib/types/review.type';
import type { CourseId } from '$lib/types/course.type';
import type { ProfessorId } from '$lib/types/prof.type';
import type { UserId } from '$lib/types/user.type';

import ReviewModel from '$lib/models/review.model.js';

import { paginateModel } from '$lib/common/paginate.js';

export async function createReview(review: ReviewCreate): Promise<Review> {
	return (await ReviewModel.create(review)).toObject();
}

export async function getReviewById(reviewId: ReviewId): Promise<Review | null> {
	return await ReviewModel.findOne({ _id: reviewId }).lean();
}

export async function getReviewsWithCondition(
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

export async function getReviewsByUserId(
	userId: UserId,
	limit = 10,
	{ fromId, toId }: { fromId?: ReviewId; toId?: ReviewId } = {}
): Promise<{ pageItems: Review[]; fromId?: ReviewId; toId?: ReviewId }> {
	return await paginateModel(ReviewModel, { userId }, limit, { fromId, toId });
}

export async function updateReviewById(
	reviewId: ReviewId,
	reviewUpdate: ReviewUpdate
): Promise<Review | null> {
	return await ReviewModel.findOneAndUpdate({ _id: reviewId }, reviewUpdate, {
		new: true
	}).lean();
}

export async function deleteReviewById(reviewId: ReviewId): Promise<Review | null> {
	return await ReviewModel.findOneAndDelete({ _id: reviewId }).lean();
}

export async function deleteAllReviewsByCourseId(courseId: CourseId): Promise<void> {
	await ReviewModel.deleteMany({ courseId });
}

export async function deleteAllReviewsByProfessorId(professorId: ProfessorId): Promise<void> {
	await ReviewModel.deleteMany({ professorId });
}

export async function searchReviewByQuery(q: string, page = 1, limit = 10): Promise<Review[]> {
	const results = await ReviewModel.find(
		{ $text: { $search: q } },
		{ searchScore: { $meta: 'textScore' } }
	)
		.sort({ searchScore: { $meta: 'textScore' }, createdAt: -1 })
		.skip((page - 1) * limit)
		.limit(limit + 1)
		.lean();
	return results;
}
