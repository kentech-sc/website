import type { FilterQuery } from 'mongoose';

import type { ReviewDoc, ReviewCreate, ReviewUpdate, ReviewId } from '$lib/types/review.type.js';
import type { CourseId } from '$lib/types/course.type.js';
import type { ProfessorId } from '$lib/types/prof.type.js';

import { ReviewModel } from '$lib/models/review.model.js';

import { paginateModel } from '$lib/common/paginate.js';

export async function createReview(review: ReviewCreate): Promise<ReviewDoc> {
	return (await ReviewModel.create(review)).toObject();
}

export async function getReviewById(reviewId: ReviewId): Promise<ReviewDoc | null> {
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
): Promise<{ pageItems: ReviewDoc[]; fromId?: ReviewId; toId?: ReviewId }> {
	const filterQuery: FilterQuery<ReviewDoc> = {};
	if (professorId) filterQuery.professorId = professorId;
	if (courseId) filterQuery.courseId = courseId;
	return await paginateModel(ReviewModel, filterQuery, limit, { fromId, toId });
}

export async function updateReviewById(
	reviewId: ReviewId,
	reviewUpdate: ReviewUpdate
): Promise<ReviewDoc | null> {
	return await ReviewModel.findOneAndUpdate({ _id: reviewId }, reviewUpdate, {
		new: true
	}).lean();
}

export async function deleteReviewById(reviewId: ReviewId): Promise<boolean> {
	const res = await ReviewModel.deleteOne({ _id: reviewId });
	return res.deletedCount > 0;
}

export async function deleteAllReviewsByCourseId(courseId: CourseId): Promise<boolean> {
	const res = await ReviewModel.deleteMany({ courseId });
	return res.deletedCount > 0;
}

export async function deleteAllReviewsByProfessorId(professorId: ProfessorId): Promise<boolean> {
	const res = await ReviewModel.deleteMany({ professorId });
	return res.deletedCount > 0;
}

export async function searchReviewsByQuery(
	q: string,
	page = 1,
	limit = 10
): Promise<{ items: ReviewDoc[]; more: boolean }> {
	const results = await ReviewModel.find(
		{ $text: { $search: q } },
		{ searchScore: { $meta: 'textScore' } }
	)
		.sort({ searchScore: { $meta: 'textScore' }, createdAt: -1 })
		.skip((page - 1) * limit)
		.limit(limit + 1)
		.lean();

	return { items: results.slice(0, limit), more: results.length > limit };
}
