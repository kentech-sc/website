import type {
	CourseId,
	Course,
	CourseCreate,
	CourseUpdate,
	Review,
	ReviewCreate,
	ReviewUpdate,
	ReviewId
} from './types.js';
import { ReviewModel, CourseModel } from './model.js';
import type { UserId } from '$lib/user/types.js';

export class CourseController {
	static async createCourse(course: CourseCreate): Promise<Course> {
		return (await CourseModel.create(course)).toObject();
	}

	static async getCourseByCourseId(courseId: CourseId): Promise<Course | null> {
		return await CourseModel.findOne({ _id: courseId }).lean();
	}

	static async getCourseArr(): Promise<Course[]> {
		return await CourseModel.find().sort({ createdAt: -1 }).lean();
	}

	static async updateCourseByCourseId(
		courseId: CourseId,
		course: CourseUpdate
	): Promise<Course | null> {
		return await CourseModel.findOneAndUpdate({ _id: courseId }, course, { new: true }).lean();
	}

	static async deleteCourseByCourseId(courseId: CourseId): Promise<void> {
		await CourseModel.deleteOne({ _id: courseId });
	}
}

export class ReviewController {
	static async createReview(review: ReviewCreate): Promise<Review> {
		const newReview = (await ReviewModel.create(review)).toObject();

		await CourseModel.updateOne(
			{
				_id: review.courseId
			},
			{
				$inc: { totalScore: review.score, reviewCnt: 1 }
			}
		);

		return newReview;
	}

	static async getReviewByReviewId(reviewId: ReviewId): Promise<Review | null> {
		return await ReviewModel.findOne({ _id: reviewId }).lean();
	}

	static async getReviewArrByCourseId(courseId: CourseId): Promise<Review[]> {
		return await ReviewModel.find({ courseId }).sort({ createdAt: -1 }).lean();
	}

	static async getReviewArrByUserId(userId: UserId): Promise<Review[]> {
		return await ReviewModel.find({ userId }).sort({ createdAt: -1 }).lean();
	}

	static async getReviewByCourseIdAndUserId(
		courseId: CourseId,
		userId: UserId
	): Promise<Review | null> {
		return await ReviewModel.findOne({ courseId, userId }).lean();
	}

	static async updateReviewByReviewId(
		reviewId: ReviewId,
		review: ReviewUpdate
	): Promise<Course | null> {
		const oldReview = await this.getReviewByReviewId(reviewId);
		if (!oldReview) return null;
		await this.deleteReviewByReviewId(reviewId);
		await this.createReview({
			courseId: oldReview.courseId,
			userId: oldReview.userId,
			score: review?.score ?? oldReview.score,
			comment: review?.comment ?? oldReview.comment
		});

		return await CourseController.getCourseByCourseId(oldReview.courseId);
	}

	static async deleteReviewByReviewId(reviewId: ReviewId): Promise<Course | null> {
		const deletedReview = await ReviewModel.findOneAndDelete({ _id: reviewId }).lean();
		if (!deletedReview) return null;

		return await CourseModel.findOneAndUpdate(
			{ _id: deletedReview.courseId },
			{
				$inc: { totalScore: -deletedReview.score, reviewCnt: -1 }
			},
			{ new: true }
		).lean();
	}

	static async deleteAllReviewsByCourseId(courseId: CourseId): Promise<void> {
		await ReviewModel.deleteMany({ courseId });
	}
}
