import CourseManager from '$lib/course/manager';
import ProfessorManager from '$lib/professor/manager';
import ReviewManager from '$lib/review/manager';
import { fail, redirect } from '@sveltejs/kit';
import { Types } from 'mongoose';
import type { CourseId, ProfessorId } from '$lib/course/types';

export const load = async () => {
	const courses = await CourseManager.getAllCourses();
	const professors = await ProfessorManager.getAllProfessors();

	return { courses: JSON.stringify(courses), professors: JSON.stringify(professors) };
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

		const review = await ReviewManager.createReview(
			courseId,
			professorId,
			locals.user._id,
			score,
			comment
		);
		redirect(302, '/review/' + review._id);
	}
};
