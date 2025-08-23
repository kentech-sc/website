import CourseReviewManager from '$lib/courseReview/manager';
import type { CourseId, ReviewId } from '$lib/courseReview/type';
import { fail, redirect } from '@sveltejs/kit';
import { Types } from 'mongoose';

export const load = async ({ params }) => {
	const courseIdRaw = params.courseId;
	if (!courseIdRaw || typeof courseIdRaw !== 'string')
		return fail(400, { message: 'courseId is undefined or invalid' });
	const courseId = new Types.ObjectId(courseIdRaw);
	const course = await CourseReviewManager.getCourseByCourseId(courseId);
	const reviewArr = (await CourseReviewManager.getReviewArrByCourseId(courseId)).reverse();

	return { course: JSON.stringify(course), reviewArr: JSON.stringify(reviewArr) };
};

export const actions = {
	createReview: async ({ request, locals, params }) => {
		const courseIdRaw = params.courseId;
		if (!courseIdRaw || typeof courseIdRaw !== 'string')
			return fail(400, { message: 'courseId is undefined or invalid' });
		const courseId = new Types.ObjectId(courseIdRaw);
		const formData = await request.formData();
		const score = Number(formData.get('score'));
		const comment = (formData.get('comment') ?? '').toString();

		if (!score || !comment) return fail(400, { message: 'score, comment are required' });

		return {
			review: JSON.stringify(
				await CourseReviewManager.createReviewByCourseId(courseId, locals.user._id, score, comment)
			)
		};
	},
	deleteCourse: async ({ request }) => {
		const formData = await request.formData();
		const courseIdRaw = formData.get('course-id');
		if (!courseIdRaw || typeof courseIdRaw !== 'string')
			return fail(400, { message: 'courseId is undefined or invalid' });
		const courseId: CourseId = new Types.ObjectId(courseIdRaw);
		await CourseReviewManager.deleteCourseByCourseId(courseId);
		redirect(302, '/review');
	},
	deleteReview: async ({ request }) => {
		const formData = await request.formData();
		const reviewIdRaw = formData.get('review-id');
		if (!reviewIdRaw || typeof reviewIdRaw !== 'string')
			return fail(400, { message: 'reviewId is undefined or invalid' });
		const reviewId: ReviewId = new Types.ObjectId(reviewIdRaw);
		const updatedCourse = await CourseReviewManager.deleteReviewByReviewId(reviewId);
		if (!updatedCourse) return fail(400, { message: 'reviewId is undefined or invalid' });
		return { reviewIdRaw, course: JSON.stringify(updatedCourse) };
	}
};
