import type {
	CourseId,
	Course,
	CourseCreate,
	ReviewUpdate,
	ReviewId,
	Review,
	ReviewCreate
} from './types.js';
import type { UserId } from '$lib/user/types.js';
import { CourseController, ReviewController } from './controller.js';
import { fillUserNames } from '$lib/general/user.js';
import mongoose from 'mongoose';
import type { ManagerResult } from '$lib/general/types.js';

export default class CourseReviewManager {
	static async createCourse(
		title: string,
		content: string,
		professor: string
	): Promise<ManagerResult<Course>> {
		const course: CourseCreate = {
			title,
			content,
			professor,
			totalScore: 0,
			reviewCnt: 0
		};
		return { ok: true, value: await CourseController.createCourse(course) };
	}

	static async getCourseArr(): Promise<ManagerResult<Course[]>> {
		const courseArr = await CourseController.getCourseArr();
		return { ok: true, value: courseArr };
	}

	static async getCourseByCourseId(courseId: CourseId): Promise<ManagerResult<Course>> {
		const course = await CourseController.getCourseByCourseId(courseId);
		if (!course) return { ok: false, error: '존재하지 않는 강의입니다.' };
		return { ok: true, value: course };
	}

	static async deleteCourseByCourseId(courseId: CourseId): Promise<ManagerResult<void>> {
		return await mongoose.connection.transaction(async () => {
			await CourseController.deleteCourseByCourseId(courseId);
			await ReviewController.deleteAllReviewsByCourseId(courseId);
			return { ok: true };
		});
	}

	static async getReviewArrByUserId(userId: UserId): Promise<ManagerResult<Review[]>> {
		const reviewArr = await ReviewController.getReviewArrByUserId(userId);
		return { ok: true, value: await fillUserNames(reviewArr) };
	}

	static async getReviewArrByCourseId(courseId: CourseId): Promise<ManagerResult<Review[]>> {
		const reviewArr = await ReviewController.getReviewArrByCourseId(courseId);
		return { ok: true, value: await fillUserNames(reviewArr) };
	}

	static async getReviewByCourseIdAndUserId(
		courseId: CourseId,
		userId: UserId
	): Promise<ManagerResult<Review | null>> {
		const review = await ReviewController.getReviewByCourseIdAndUserId(courseId, userId);
		if (!review) return { ok: false, error: '존재하지 않는 리뷰입니다.' };
		return { ok: true, value: (await fillUserNames([review]))[0] };
	}

	static async createReviewByCourseId(
		courseId: CourseId,
		userId: UserId,
		score: number,
		comment: string
	): Promise<ManagerResult<Review>> {
		const review: ReviewCreate = {
			courseId,
			userId,
			score,
			comment
		};

		return { ok: true, value: await ReviewController.createReview(review) };
	}

	static async updateReviewByReviewId(
		reviewId: ReviewId,
		score: number,
		comment: string
	): Promise<ManagerResult<Course | null>> {
		const review: ReviewUpdate = {
			score,
			comment
		};

		return { ok: true, value: await ReviewController.updateReviewByReviewId(reviewId, review) };
	}

	static async deleteReviewByReviewId(reviewId: ReviewId): Promise<ManagerResult<Course | null>> {
		return { ok: true, value: await ReviewController.deleteReviewByReviewId(reviewId) };
	}
}
