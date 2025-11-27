import * as CourseService from '$lib/srv/course.srv.js';
import * as ProfessorService from '$lib/srv/prof.srv.js';
import * as ReviewService from '$lib/srv/review.srv.js';
import * as ReviewRule from '$lib/rules/review.rule.js';

import { Types } from 'mongoose';
import { fail, redirect } from '@sveltejs/kit';

import { withActionErrorHandling, withLoadErrorHandling } from '$lib/common/errors.js';

import type { CourseId } from '$lib/types/course.type.js';
import type { ProfessorId } from '$lib/types/prof.type.js';

export const load = withLoadErrorHandling(async () => {
	const courses = await CourseService.getAllCourses();
	const professors = await ProfessorService.getAllProfessors();

	return { courses: JSON.stringify(courses), professors: JSON.stringify(professors) };
});

export const actions = {
	createReview: withActionErrorHandling(async ({ request, locals }) => {
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

		if (!ReviewRule.checkReviewYearAndTerm(year, term))
			return fail(400, { message: '연도 또는 학기 값이 올바르지 않습니다.' });
		if (!ReviewRule.checkReviewScore(score))
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
	})
};
