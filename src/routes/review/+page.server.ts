import ReviewService from '$lib/review/service';
import ReviewApplication from '$lib/applications/review.js';
import CourseService from '$lib/course/service';
import ProfessorService from '$lib/professor/service';
import { Types } from 'mongoose';

export const load = async ({ url }) => {
	const fromIdRaw = url.searchParams.get('from');
	const fromId = fromIdRaw ? new Types.ObjectId(fromIdRaw) : undefined;

	const toIdRaw = url.searchParams.get('to');
	const toId = toIdRaw ? new Types.ObjectId(toIdRaw) : undefined;

	const courseIdRaw = url.searchParams.get('course');
	const courseId = courseIdRaw ? new Types.ObjectId(courseIdRaw) : undefined;

	const professorIdRaw = url.searchParams.get('professor');
	const professorId = professorIdRaw ? new Types.ObjectId(professorIdRaw) : undefined;

	const limit = 3;

	const reviewsResult = await ReviewService.getReviews(limit, {
		fromId,
		toId,
		courseId,
		professorId
	});
	const reviewsRaw = reviewsResult.pageItems;
	const reviews = await ReviewApplication.fillReviews(reviewsRaw);

	const courses = await CourseService.getAllCourses();
	const professors = await ProfessorService.getAllProfessors();

	return {
		reviews: JSON.stringify(reviews),
		fromId: reviewsResult.fromId?.toString(),
		toId: reviewsResult.toId?.toString(),
		courses: JSON.stringify(courses),
		professors: JSON.stringify(professors)
	};
};
