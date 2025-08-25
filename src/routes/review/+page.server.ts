import CourseReviewManager from '$lib/courseReview/manager';

export const load = async () => {
	const courseArr = await CourseReviewManager.getCourseArr();
	return { courseArr: JSON.stringify(courseArr) };
};
