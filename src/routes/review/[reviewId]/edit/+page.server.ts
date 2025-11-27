import * as CourseService from '$lib/srv/course.srv.js';
import * as ProfessorService from '$lib/srv/prof.srv.js';
import * as ReviewService from '$lib/srv/review.srv.js';

import { fail, redirect } from '@sveltejs/kit';
import { Types } from 'mongoose';

import { withActionErrorHandling, withLoadErrorHandling } from '$lib/common/errors.js';

import type { CourseId } from '$lib/types/course.type.js';
import type { ProfessorId } from '$lib/types/prof.type.js';

import * as ReviewApplication from '$lib/app/review.app.js';

export const load = withLoadErrorHandling(async ({ params }) => {
	const courses = await CourseService.getAllCourses();
	const professors = await ProfessorService.getAllProfessors();

	const reviewIdRaw = params.reviewId;
	const reviewId = new Types.ObjectId(reviewIdRaw);

	const reviewRaw = await ReviewService.getReviewById(reviewId);

	const review = (await ReviewApplication.fillReviews([reviewRaw]))[0];

	return {
		courses: JSON.stringify(courses),
		professors: JSON.stringify(professors),
		review: JSON.stringify(review)
	};
});

export const actions = {
	editReview: withActionErrorHandling(async ({ request, locals, params }) => {
		const reviewIdRaw = params.reviewId;
		const reviewId = new Types.ObjectId(reviewIdRaw);

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

		const review = await ReviewService.editReviewById(
			reviewId,
			{
				courseId,
				professorId,
				year,
				term,
				title,
				score,
				comment
			},
			locals.user
		);
		redirect(302, '/review/' + review._id);
	})
};
