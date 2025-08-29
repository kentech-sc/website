import { CourseManager, ProfessorManager } from '$lib/course/manager';
import ReviewManager from '$lib/review/manager';
import { error, fail, redirect } from '@sveltejs/kit';
import { Types } from 'mongoose';
import type { CourseId, ProfessorId } from '$lib/course/types';

export const load = async () => {
	const course_res = await CourseManager.getAllCourseArr();
	if (!course_res.ok) error(400, { message: course_res.error });
	const courseArr = course_res.value;

	const professor_res = await ProfessorManager.getAllProfessorArr();
	if (!professor_res.ok) error(400, { message: professor_res.error });
	const professorArr = professor_res.value;

	return { courseArr: JSON.stringify(courseArr), professorArr: JSON.stringify(professorArr) };
};

export const actions = {
	createReview: async ({ request, locals }) => {
		const formData = await request.formData();

		const courseIdRaw = (formData.get('courseId') ?? '').toString();
		if (!courseIdRaw || typeof courseIdRaw !== 'string')
			return fail(400, { message: 'courseId is undefined or invalid' });
		const courseId: CourseId = new Types.ObjectId(courseIdRaw);

		const professorIdRaw = (formData.get('professorId') ?? '').toString();
		if (!professorIdRaw || typeof professorIdRaw !== 'string')
			return fail(400, { message: 'professorId is undefined or invalid' });
		const professorId: ProfessorId = new Types.ObjectId(professorIdRaw);

		const score = Number(formData.get('score'));
		const comment = (formData.get('comment') ?? '').toString();

		if (!courseId || !professorId || !score || !comment)
			return fail(400, { message: 'courseId, professorId, score, comment are required' });

		const review_res = await ReviewManager.createReview(
			courseId,
			professorId,
			locals.user._id,
			score,
			comment
		);
		if (!review_res.ok) return fail(400, { message: review_res.error });

		const review = review_res.value;
		redirect(302, '/review/' + review._id);
	}
};
