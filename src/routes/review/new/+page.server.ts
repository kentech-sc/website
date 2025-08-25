import CourseReviewManager from '$lib/courseReview/manager';
import { fail, redirect } from '@sveltejs/kit';

// export const load = async () => {
// 	const courseArr = await CourseReviewManager.getCourseArr();
// 	return { courseArr: JSON.stringify(courseArr) };
// };

export const actions = {
	createCourse: async ({ request }) => {
		const formData = await request.formData();
		const title = (formData.get('title') ?? '').toString();
		const content = (formData.get('content') ?? '').toString();
		const professor = (formData.get('professor') ?? '').toString();

		if (!title || !content || !professor)
			return fail(400, { message: 'title, content, professor are required' });

		const course = await CourseReviewManager.createCourse(title, content, professor);
		// return { course: JSON.stringify(course) };
		redirect(302, '/review/' + course._id);
	}
};
