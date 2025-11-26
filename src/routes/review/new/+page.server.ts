import CourseService from '$lib/srv/course.srv';
import ProfessorService from '$lib/srv/prof.srv';
import ReviewService from '$lib/srv/review.srv';
import { fail, redirect } from '@sveltejs/kit';
import { Types } from 'mongoose';
import type { CourseId } from '$lib/types/course.type';
import type { ProfessorId } from '$lib/types/prof.type';

export const load = async () => {
	const courses = await CourseService.getAllCourses();
	const professors = await ProfessorService.getAllProfessors();

	return { courses: JSON.stringify(courses), professors: JSON.stringify(professors) };
};

export const actions = {
	createReview: async ({ request, locals }) => {
		const formData = await request.formData();

		const courseIdRaw = (formData.get('courseId') ?? '').toString();
		const professorIdRaw = (formData.get('professorId') ?? '').toString();

		const year = Number(formData.get('year'));
		const term = Number(formData.get('term'));
		const title = (formData.get('title') ?? '').toString();

		const score = {
			assignment: Number(formData.get('assignmentScore')),
			lecture: Number(formData.get('lectureScore')),
			exam: Number(formData.get('examScore'))
		};

		const comment = (formData.get('comment') ?? '').toString();

		if (!courseIdRaw || !professorIdRaw || !year || !term || !title || !score)
			return fail(400, {
				message: 'courseId, professorId, year, term, title, score are required'
			});

		const courseId: CourseId = new Types.ObjectId(courseIdRaw);
		const professorId: ProfessorId = new Types.ObjectId(professorIdRaw);

		if (!ReviewService.checkReviewYearAndTerm(year, term))
			return fail(400, { message: '연도 또는 학기 값이 올바르지 않습니다.' });
		if (!ReviewService.checkReviewScore(score))
			return fail(400, { message: '점수는 1에서 10 사이의 값이어야 합니다.' });

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
