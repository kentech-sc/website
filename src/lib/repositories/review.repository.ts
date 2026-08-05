import { and, desc, eq, exists, ilike, isNotNull, or, sql } from 'drizzle-orm';

import { asEntity, firstOrNull } from './repository.utils.js';

import type { OfferingId } from '$lib/types/academic.type.js';
import type { CourseId } from '$lib/types/course.type.js';
import type { ProfessorId } from '$lib/types/professor.type.js';
import type { ReviewCreate, ReviewEntity, ReviewId, ReviewUpdate } from '$lib/types/review.type.js';
import type { UserId } from '$lib/types/user.type.js';

import { courseOfferingProfessors, courseOfferings, reviews } from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';

type ReviewRow = typeof reviews.$inferSelect;

function toReview(row: ReviewRow): ReviewEntity {
	return asEntity<ReviewEntity>({
		id: row.id,
		offeringId: row.offeringId,
		courseId: row.courseId,
		professorId: row.professorId,
		userId: row.userId,
		year: row.year,
		term: row.term,
		title: row.title,
		score: {
			assignment: row.assignmentScore,
			lecture: row.lectureScore,
			exam: row.examScore,
			satisfaction: row.satisfactionScore
		},
		comment: row.comment,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt
	});
}

function toReviewValues(review: ReviewCreate | ReviewUpdate) {
	const { score, ...values } = review;
	return {
		...values,
		assignmentScore: score?.assignment,
		lectureScore: score?.lecture,
		examScore: score?.exam,
		satisfactionScore: score?.satisfaction
	};
}

function filter(professorId?: ProfessorId, courseId?: CourseId) {
	const conditions = [];
	if (professorId) {
		const offeringProfessorMatch = getDatabase()
			.select({ professorId: courseOfferingProfessors.professorId })
			.from(courseOfferingProfessors)
			.where(
				and(
					eq(courseOfferingProfessors.offeringId, reviews.offeringId),
					eq(courseOfferingProfessors.professorId, professorId)
				)
			);
		conditions.push(or(eq(reviews.professorId, professorId), exists(offeringProfessorMatch))!);
	}
	if (courseId)
		conditions.push(or(eq(reviews.courseId, courseId), eq(courseOfferings.courseId, courseId))!);
	return conditions.length > 0 ? and(...conditions) : undefined;
}

function searchFilter(query: string) {
	const pattern = `%${query}%`;
	return or(ilike(reviews.title, pattern), ilike(reviews.comment, pattern))!;
}

export async function countReviews(
	professorId?: ProfessorId,
	courseId?: CourseId
): Promise<number> {
	const [result] = await getDatabase()
		.select({ count: sql<number>`count(*)::int` })
		.from(reviews)
		.leftJoin(courseOfferings, eq(reviews.offeringId, courseOfferings.id))
		.where(filter(professorId, courseId));
	return result.count;
}

export async function countReviewsByQuery(query: string): Promise<number> {
	const [result] = await getDatabase()
		.select({ count: sql<number>`count(*)::int` })
		.from(reviews)
		.where(searchFilter(query));
	return result.count;
}

export async function createReview(review: ReviewCreate): Promise<ReviewEntity> {
	const [created] = await getDatabase()
		.insert(reviews)
		.values(toReviewValues(review) as typeof reviews.$inferInsert)
		.returning();
	return toReview(created);
}

export async function findReviewById(reviewId: ReviewId): Promise<ReviewEntity | null> {
	const rows = await getDatabase().select().from(reviews).where(eq(reviews.id, reviewId)).limit(1);
	const row = firstOrNull(rows);
	return row ? toReview(row) : null;
}

export async function findReviewByUserAndOffering(
	userId: UserId,
	offeringId: OfferingId
): Promise<ReviewEntity | null> {
	const rows = await getDatabase()
		.select()
		.from(reviews)
		.where(and(eq(reviews.userId, userId), eq(reviews.offeringId, offeringId)))
		.limit(1);
	const row = firstOrNull(rows);
	return row ? toReview(row) : null;
}

export async function findReviewedOfferingIds(userId: UserId): Promise<Set<OfferingId>> {
	const rows = await getDatabase()
		.select({ offeringId: reviews.offeringId })
		.from(reviews)
		.where(and(eq(reviews.userId, userId), isNotNull(reviews.offeringId)));
	return new Set(rows.flatMap((row) => (row.offeringId ? [row.offeringId] : [])));
}

export async function findRecentReviews(
	limit = 10,
	skip = 0,
	professorId?: ProfessorId,
	courseId?: CourseId
): Promise<ReviewEntity[]> {
	const rows = await getDatabase()
		.select({ review: reviews })
		.from(reviews)
		.leftJoin(courseOfferings, eq(reviews.offeringId, courseOfferings.id))
		.where(filter(professorId, courseId))
		.orderBy(desc(reviews.createdAt))
		.offset(skip)
		.limit(limit);
	return rows.map(({ review }) => toReview(review));
}

export async function linkReviewOffering(
	reviewId: ReviewId,
	offeringId: OfferingId
): Promise<ReviewEntity | null> {
	const rows = await getDatabase()
		.update(reviews)
		.set({
			offeringId,
			courseId: null,
			professorId: null,
			year: null,
			term: null,
			updatedAt: sql`now()`
		})
		.where(eq(reviews.id, reviewId))
		.returning();
	const row = firstOrNull(rows);
	return row ? toReview(row) : null;
}

export async function updateReviewById(
	reviewId: ReviewId,
	reviewUpdate: ReviewUpdate
): Promise<ReviewEntity | null> {
	const rows = await getDatabase()
		.update(reviews)
		.set({ ...toReviewValues(reviewUpdate), updatedAt: sql`now()` })
		.where(eq(reviews.id, reviewId))
		.returning();
	const row = firstOrNull(rows);
	return row ? toReview(row) : null;
}

export async function deleteReviewById(reviewId: ReviewId): Promise<boolean> {
	const rows = await getDatabase()
		.delete(reviews)
		.where(eq(reviews.id, reviewId))
		.returning({ id: reviews.id });
	return rows.length > 0;
}

export async function searchReviewsByQuery(
	query: string,
	limit = 10,
	skip = 0
): Promise<Array<ReviewEntity & { searchScore?: number }>> {
	const rows = await getDatabase()
		.select()
		.from(reviews)
		.where(searchFilter(query))
		.orderBy(desc(reviews.createdAt))
		.offset(skip)
		.limit(limit);
	return rows.map((row) => ({ ...toReview(row), searchScore: 1 }));
}
