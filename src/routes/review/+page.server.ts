import ReviewService from '$lib/srv/review.srv';
import ReviewApplication from '$lib/applications/review.js';
import CourseService from '$lib/srv/course.srv';
import ProfessorService from '$lib/srv/prof.srv';
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

	const limit = 10;

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
