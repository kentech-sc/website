import mongoose from 'mongoose';

import type { ActivityLogCreate } from '$lib/types/activity-log.type.js';
import type { CourseId } from '$lib/types/course.type.js';
import type { Page } from '$lib/types/general.type.js';
import type { ProfessorId } from '$lib/types/professor.type.js';
import type {
	ReviewCreate,
	ReviewId,
	ReviewUpdate,
	Review,
	ReviewEntity
} from '$lib/types/review.type.js';
import type { User } from '$lib/types/user.type.js';

import * as ActivityLogService from '$lib/services/activity-log.service.js';
import * as CourseService from '$lib/services/course.service.js';
import * as ProfessorService from '$lib/services/professor.service.js';
import * as ReviewService from '$lib/services/review.service.js';
import * as ThrottleService from '$lib/services/throttle.service.js';
import { hasAnyCapability, hasCapability } from '$lib/shared/permission.js';

export async function fillReviews(reviews: ReviewEntity[]): Promise<Review[]> {
	const [courseIdToCourse, professorIdToProfessor] = await Promise.all([
		CourseService.findCourseMapByIds(reviews.map((review) => review.courseId)),
		ProfessorService.findProfessorMapByIds(reviews.map((review) => review.professorId))
	]);

	return reviews.map((review) => ({
		...review,
		courseName: courseIdToCourse.get(review.courseId.toString())?.name ?? null,
		professorName: professorIdToProfessor.get(review.professorId.toString())?.name ?? null
	}));
}

export async function getReviewFormOptions() {
	const [courses, professors] = await Promise.all([
		CourseService.findCourses(),
		ProfessorService.findProfessors()
	]);

	return { courses, professors };
}

export async function getReviewPage(
	page: number,
	user: User,
	courseId?: CourseId,
	professorId?: ProfessorId
) {
	const limit = 10;
	const skip = (page - 1) * limit;
	const reviewPage = await ReviewService.getReviewPage(limit, skip, professorId, courseId);
	reviewPage.items = await fillReviews(reviewPage.items);

	return {
		reviewPage: reviewPage as Page<Review>,
		canCreateReview: hasCapability(user, 'review.write'),
		canManageCatalog: hasAnyCapability(user, ['course.manage', 'professor.manage'])
	};
}

export async function getReviewDetail(reviewId: ReviewId, user: User) {
	const reviewRaw = await ReviewService.getReviewById(reviewId);
	const review = (await fillReviews([reviewRaw]))[0];

	return {
		review,
		permissions: ReviewService.getReviewPermissions(review, user)
	};
}

export async function getReviewEditData(reviewId: ReviewId, user: User) {
	const [formOptions, detail] = await Promise.all([
		getReviewFormOptions(),
		getReviewDetail(reviewId, user)
	]);

	return {
		...formOptions,
		review: detail.review,
		permissions: detail.permissions
	};
}

export async function createReview(reviewCreate: ReviewCreate, user: User) {
	return await mongoose.connection.transaction(async () => {
		await ThrottleService.reserve(user._id, 'article');
		const review = await ReviewService.createReview(reviewCreate, user);
		const activityLog: ActivityLogCreate = {
			actorId: user._id,
			action: 'create',
			targetType: 'review',
			targetId: review._id,
			parentTargetId: null,
			cause: 'direct',
			beforeSnapshot: null,
			afterSnapshot: review
		};
		await ActivityLogService.create(activityLog);
		return review;
	});
}

export async function editReview(reviewId: ReviewId, reviewUpdate: ReviewUpdate, user: User) {
	return await mongoose.connection.transaction(async () => {
		const beforeReview = await ReviewService.getReviewById(reviewId);
		const review = await ReviewService.editReviewById(reviewId, reviewUpdate, user);
		const activityLog: ActivityLogCreate = {
			actorId: user._id,
			action: 'edit',
			targetType: 'review',
			targetId: review._id,
			parentTargetId: null,
			cause: 'direct',
			beforeSnapshot: beforeReview,
			afterSnapshot: review
		};
		await ActivityLogService.create(activityLog);
		return review;
	});
}

export async function deleteReview(reviewId: ReviewId, user: User) {
	return await mongoose.connection.transaction(async () => {
		const review = await ReviewService.deleteReviewById(reviewId, user);
		const activityLog: ActivityLogCreate = {
			actorId: user._id,
			action: 'delete',
			targetType: 'review',
			targetId: review._id,
			parentTargetId: null,
			cause: 'direct',
			beforeSnapshot: review,
			afterSnapshot: null
		};
		await ActivityLogService.create(activityLog);
		return review;
	});
}
