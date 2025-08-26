import CourseReviewManager from '$lib/courseReview/manager';
import BoardManager from '$lib/board/manager';
import { error } from '@sveltejs/kit';

export const load = async () => {
	const course_res = await CourseReviewManager.getCourseArr();
	if (!course_res.ok) error(400, { message: course_res.error });
	const courseArr = course_res.value;

	const post_res = await BoardManager.getPostsByBoardId('main');
	if (!post_res.ok) error(400, { message: post_res.error });
	const postArr = post_res.value;

	return { postArr: JSON.stringify(postArr), courseArr: JSON.stringify(courseArr) };
};
