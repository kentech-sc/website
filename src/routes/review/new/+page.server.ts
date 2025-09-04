import CourseService from '$lib/course/service';
import ProfessorService from '$lib/professor/service';
import ReviewService from '$lib/review/service';
import { fail, redirect } from '@sveltejs/kit';
import { Types } from 'mongoose';
import type { CourseId } from '$lib/course/types';
import type { ProfessorId } from '$lib/professor/types';

export const load = async () => {
	const courses = await CourseService.getAllCourses();
	const professors = await ProfessorService.getAllProfessors();

	return { courses: JSON.stringify(courses), professors: JSON.stringify(professors) };
};

export const actions = {
	createReview: async ({ request, locals }) => {
		const formData = await request.formData();

		const courseIdRaw = (formData.get('courseId') ?? '').toString();
		const courseId: CourseId = new Types.ObjectId(courseIdRaw);

		const professorIdRaw = (formData.get('professorId') ?? '').toString();
		const professorId: ProfessorId = new Types.ObjectId(professorIdRaw);

		const year = Number(formData.get('year'));
		const term = Number(formData.get('term'));
		const title = (formData.get('title') ?? '').toString();

		const score = {
			assignment: Number(formData.get('assignmentScore')),
			lecture: Number(formData.get('lectureScore')),
			exam: Number(formData.get('examScore'))
		};

		const comment = (formData.get('comment') ?? '').toString();

		if (!courseId || !professorId || !year || !term || !title || !score || !comment)
			return fail(400, {
				message: 'courseId, professorId, year, term, title, score, comment are required'
			});

		const review = await ReviewService.createReview(
			courseId,
			professorId,
			locals.user._id,
			year,
			term,
			title,
			score,
			comment
		);
		redirect(302, '/review/' + review._id);
	}
};
