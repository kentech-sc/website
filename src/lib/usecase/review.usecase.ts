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

import * as AcademicRepository from '$lib/repositories/academic.repository.js';
import * as ReviewRepository from '$lib/repositories/review.repository.js';
import { transaction } from '$lib/server/db.js';
import * as ActivityLogService from '$lib/services/activity-log.service.js';
import * as CourseService from '$lib/services/course.service.js';
import * as PointService from '$lib/services/point.service.js';
import * as ProfessorService from '$lib/services/professor.service.js';
import * as ReviewService from '$lib/services/review.service.js';
import * as ThrottleService from '$lib/services/throttle.service.js';
import { hasCapability } from '$lib/shared/permission.js';

export async function fillReviews(reviews: ReviewEntity[]): Promise<Review[]> {
	const offeringMap = await AcademicRepository.findOfferingMapByIds(
		reviews.map((review) => review.offeringId)
	);
	return reviews.map((review) => {
		const offering = offeringMap.get(review.offeringId);
		if (!offering) throw new Error(`강의평 ${review.id}의 강좌 정보를 확인할 수 없습니다.`);
		return {
			...review,
			courseId: offering.courseId,
			year: offering.year,
			term: offering.term,
			section: offering.section,
			courseName: offering.courseName,
			subtitle: offering.subtitle,
			professors: offering.professors
		};
	});
}

export async function getReviewFilterOptions() {
	const [courses, professors] = await Promise.all([
		CourseService.findInstructionalCourses(),
		ProfessorService.findProfessors()
	]);
	return { courses, professors };
}

export async function getReviewFormOptions(user: User) {
	const [reviewableOfferings, reviewedOfferingIds] = await Promise.all([
		AcademicRepository.findAllOfferings(),
		ReviewRepository.findReviewedOfferingIds(user.id)
	]);

	return {
		reviewableOfferings: reviewableOfferings.filter(
			(offering) => !reviewedOfferingIds.has(offering.id)
		)
	};
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
		canCreateReview: hasCapability(user, 'review.write')
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
		getReviewFormOptions(user),
		getReviewDetail(reviewId, user)
	]);

	return {
		...formOptions,
		review: detail.review,
		permissions: detail.permissions
	};
}

export async function createReview(reviewCreate: ReviewCreate, user: User) {
	return await transaction(async () => {
		await ThrottleService.reserve(user.id, 'article');
		const review = await ReviewService.createReview(reviewCreate, user);
		const activityLog: ActivityLogCreate = {
			actorId: user.id,
			action: 'create',
			targetType: 'review',
			targetId: review.id,

			cause: 'direct',
			beforeSnapshot: null,
			afterSnapshot: review
		};
		await ActivityLogService.create(activityLog);
		await PointService.awardReviewCreate(user.id, review.id);
		return review;
	});
}

export async function editReview(reviewId: ReviewId, reviewUpdate: ReviewUpdate, user: User) {
	return await transaction(async () => {
		const beforeReview = await ReviewService.getReviewById(reviewId);
		const review = await ReviewService.editReviewById(reviewId, reviewUpdate, user);
		const activityLog: ActivityLogCreate = {
			actorId: user.id,
			action: 'edit',
			targetType: 'review',
			targetId: review.id,

			cause: 'direct',
			beforeSnapshot: beforeReview,
			afterSnapshot: review
		};
		await ActivityLogService.create(activityLog);
		return review;
	});
}

export async function deleteReview(reviewId: ReviewId, user: User) {
	return await transaction(async () => {
		const review = await ReviewService.deleteReviewById(reviewId, user);
		const activityLog: ActivityLogCreate = {
			actorId: user.id,
			action: 'delete',
			targetType: 'review',
			targetId: review.id,

			cause: 'direct',
			beforeSnapshot: review,
			afterSnapshot: null
		};
		await ActivityLogService.create(activityLog);
		return review;
	});
}
