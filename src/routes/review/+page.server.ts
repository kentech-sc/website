import CourseReviewManager from '$lib/courseReview/manager';
import { error } from '@sveltejs/kit';

export const load = async () => {
	const course_res = await CourseReviewManager.getCourseArr();
	if (!course_res.ok) error(400, { message: course_res.error });
	const courseArr = course_res.value;
	return { courseArr: JSON.stringify(courseArr) };
};
