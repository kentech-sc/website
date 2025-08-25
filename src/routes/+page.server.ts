import CourseReviewManager from '$lib/courseReview/manager';
import BoardManager from '$lib/board/manager';

export const load = async () => {
	const courseArr = await CourseReviewManager.getCourseArr();
	const postArr = await BoardManager.getPostsByBoardId('main');
	return { postArr: JSON.stringify(postArr), courseArr: JSON.stringify(courseArr) };
};
