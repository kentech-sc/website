import type {
	CourseId,
	Course,
	CourseCreate,
	ReviewUpdate,
	ReviewId,
	Review,
	ReviewCreate
} from './type.js';
import type { UserId } from '$lib/user/type.js';
import { CourseController, ReviewController } from './controller.js';
import { fillUserNames } from '$lib/utils/user';
import mongoose from 'mongoose';

export default class CourseReviewManager {
	static async createCourse(title: string, content: string, professor: string): Promise<Course> {
		const course: CourseCreate = {
			title,
			content,
			professor,
			totalScore: 0,
			reviewCnt: 0
		};
		return await CourseController.setCourse(course);
	}

	static getCourseArr = CourseController.getCourseArr;
	static getCourseByCourseId = CourseController.getCourseByCourseId;
	static async deleteCourseByCourseId(courseId: CourseId): Promise<void> {
		return await mongoose.connection.transaction(async () => {
			await CourseController.deleteCourseByCourseId(courseId);
			await ReviewController.deleteAllReviewsByCourseId(courseId);
		});
	}

	static async getReviewArrByUserId(userId: UserId): Promise<Review[]> {
		const reviewArr = await ReviewController.getReviewArrByUserId(userId);
		return await fillUserNames(reviewArr);
	}

	static async getReviewArrByCourseId(courseId: CourseId): Promise<Review[]> {
		const reviewArr = await ReviewController.getReviewArrByCourseId(courseId);
		return await fillUserNames(reviewArr);
	}

	static async getReviewByCourseIdAndUserId(
		courseId: CourseId,
		userId: UserId
	): Promise<Review | null> {
		const review = await ReviewController.getReviewByCourseIdAndUserId(courseId, userId);
		if (!review) return null;
		return (await fillUserNames([review]))[0];
	}

	static async createReviewByCourseId(
		courseId: CourseId,
		userId: UserId,
		score: number,
		comment: string
	): Promise<Review> {
		const review: ReviewCreate = {
			courseId,
			userId,
			score,
			comment
		};

		return await ReviewController.setReview(review);
	}

	static async updateReviewByReviewId(
		reviewId: ReviewId,
		score: number,
		comment: string
	): Promise<Course | null> {
		const review: ReviewUpdate = {
			score,
			comment
		};

		return await ReviewController.updateReviewByReviewId(reviewId, review);
	}

	static async deleteReviewByReviewId(reviewId: ReviewId): Promise<Course | null> {
		return await ReviewController.deleteReviewByReviewId(reviewId);
	}
}
