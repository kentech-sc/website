import CourseReviewManager from '$lib/courseReview/manager';
import type { CourseId, ReviewId } from '$lib/courseReview/types';
import { error, fail, redirect } from '@sveltejs/kit';
import { Types } from 'mongoose';

export const load = async ({ params }) => {
	const courseIdRaw = params.courseId;
	if (!courseIdRaw || typeof courseIdRaw !== 'string')
		return fail(400, { message: 'courseId is undefined or invalid' });
	const courseId = new Types.ObjectId(courseIdRaw);

	const course_res = await CourseReviewManager.getCourseByCourseId(courseId);
	if (!course_res.ok) error(400, { message: course_res.error });
	const course = course_res.value;

	const review_res = await CourseReviewManager.getReviewArrByCourseId(courseId);
	if (!review_res.ok) error(400, { message: review_res.error });
	const reviewArr = review_res.value.reverse();

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

		const review_res = await CourseReviewManager.createReviewByCourseId(
			courseId,
			locals.user._id,
			score,
			comment
		);
		if (!review_res.ok) return fail(400, { message: review_res.error });
		const review = review_res.value;
		review.userName = locals.user.name;

		return {
			review: JSON.stringify(review)
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
		const course_res = await CourseReviewManager.deleteReviewByReviewId(reviewId);
		if (!course_res.ok) return fail(400, { message: course_res.error });
		const course = course_res.value;
		return { reviewIdRaw, course: JSON.stringify(course) };
	}
};
