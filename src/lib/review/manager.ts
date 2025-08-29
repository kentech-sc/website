import type { ReviewUpdate, ReviewId, Review, ReviewCreate } from './types.js';
import type { UserId } from '$lib/user/types.js';
import ReviewController from './controller.js';
import UserManager from '$lib/user/manager.js';
import type { ManagerResult } from '$lib/general/types.js';
import type { CourseId, ProfessorId } from '$lib/course/types.js';
import { CourseManager } from '$lib/course/manager.js';
import { ProfessorManager } from '$lib/course/manager.js';

export default class ReviewManager {
	static async createReview(
		courseId: CourseId,
		professorId: ProfessorId,
		userId: UserId,
		score: number,
		comment: string
	): Promise<ManagerResult<Review>> {
		const review: ReviewCreate = {
			courseId,
			professorId,
			userId,
			score,
			comment
		};
		console.log(review);
		return { ok: true, value: await ReviewController.createReview(review) };
	}

	static async #fillReviewArr(reviewArr: Review[]): Promise<Review[]> {
		reviewArr = await UserManager.fillDisplayNamesByDisplayType(reviewArr, 'nickname');
		reviewArr = await CourseManager.fillCourseInfosByCourseId(reviewArr);
		reviewArr = await ProfessorManager.fillProfessorNamesByProfessorId(reviewArr);
		return reviewArr;
	}

	static async getReviewByReviewId(reviewId: ReviewId): Promise<ManagerResult<Review>> {
		const review = await ReviewController.getReviewByReviewId(reviewId);
		if (!review) return { ok: false, error: '존재하지 않는 리뷰입니다.' };
		return { ok: true, value: (await this.#fillReviewArr([review]))[0] };
	}

	static async getAllReviewArr(): Promise<ManagerResult<Review[]>> {
		const reviewArr = await ReviewController.getAllReviews();
		return { ok: true, value: await this.#fillReviewArr(reviewArr) };
	}

	static async getReviewArrByCourseId(courseId: CourseId): Promise<ManagerResult<Review[]>> {
		const reviewArr = await ReviewController.getReviewsByCourseId(courseId);
		return { ok: true, value: await this.#fillReviewArr(reviewArr) };
	}

	static async getReviewArrByProfessorId(
		professorId: ProfessorId
	): Promise<ManagerResult<Review[]>> {
		const reviewArr = await ReviewController.getReviewsByProfessorId(professorId);
		return { ok: true, value: await this.#fillReviewArr(reviewArr) };
	}

	static async getReviewArrByUserId(userId: UserId): Promise<ManagerResult<Review[]>> {
		const reviewArr = await ReviewController.getReviewsByUserId(userId);
		return { ok: true, value: await this.#fillReviewArr(reviewArr) };
	}

	static async updateReviewByReviewId(
		reviewId: ReviewId,
		score: number,
		comment: string
	): Promise<ManagerResult<Review | null>> {
		const review: ReviewUpdate = {
			score,
			comment
		};

		return { ok: true, value: await ReviewController.updateReviewByReviewId(reviewId, review) };
	}

	static async deleteReviewByReviewId(reviewId: ReviewId): Promise<ManagerResult<Review | null>> {
		return { ok: true, value: await ReviewController.deleteReviewByReviewId(reviewId) };
	}
}
