import type { FilterQuery } from 'mongoose';

import type { ReviewEntity, ReviewCreate, ReviewUpdate, ReviewId } from '$lib/types/review.type.js';
import type { CourseId } from '$lib/types/course.type.js';
import type { ProfessorId } from '$lib/types/professor.type.js';

import { ReviewModel } from '$lib/models/review.model.js';

import { toPojo } from '$lib/shared/utils.js';

export async function countReviews(
	professorId?: ProfessorId,
	courseId?: CourseId
): Promise<number> {
	const filterQuery: FilterQuery<ReviewEntity> = {};
	if (professorId) filterQuery.professorId = professorId;
	if (courseId) filterQuery.courseId = courseId;
	return await ReviewModel.countDocuments(filterQuery);
}

export async function createReview(review: ReviewCreate): Promise<ReviewEntity> {
	return toPojo<ReviewEntity>((await ReviewModel.create(review)).toObject());
}

export async function findReviewById(reviewId: ReviewId): Promise<ReviewEntity | null> {
	return toPojo<ReviewEntity | null>(await ReviewModel.findOne({ _id: reviewId }).lean());
}

export async function findRecentReviews(
	limit = 10,
	skip = 0,
	professorId?: ProfessorId,
	courseId?: CourseId
): Promise<Array<ReviewEntity>> {
	const filterQuery: FilterQuery<ReviewEntity> = {};
	if (professorId) filterQuery.professorId = professorId;
	if (courseId) filterQuery.courseId = courseId;

	return toPojo<ReviewEntity[]>(
		await ReviewModel.find(filterQuery).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()
	);
}

export async function updateReviewById(
	reviewId: ReviewId,
	reviewUpdate: ReviewUpdate
): Promise<ReviewEntity | null> {
	return toPojo<ReviewEntity | null>(
		await ReviewModel.findOneAndUpdate({ _id: reviewId }, reviewUpdate, {
			returnDocument: 'after'
		}).lean()
	);
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
): Promise<{ items: ReviewEntity[]; more: boolean }> {
	const results = await ReviewModel.find(
		{ $text: { $search: q } },
		{ searchScore: { $meta: 'textScore' } }
	)
		.sort({ searchScore: { $meta: 'textScore' }, createdAt: -1 })
		.skip((page - 1) * limit)
		.limit(limit + 1)
		.lean();

	return { items: toPojo<ReviewEntity[]>(results.slice(0, limit)), more: results.length > limit };
}

export async function convertProfessorIdsToString() {
	const reviews = (await ReviewModel.find().lean()).map(review => {
		review.professorId = review.professorId.toString();
		return review;
	});
	await Promise.all(reviews.map(review => ReviewModel.updateOne({ _id: review._id }, { professorId: review.professorId })));
}
