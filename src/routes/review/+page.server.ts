import ReviewService from '$lib/review/service';
import ReviewApplication from '$lib/applications/review.js';
import CourseService from '$lib/course/service';
import ProfessorService from '$lib/professor/service';

export const load = async () => {
	const reviewsRaw = await ReviewService.getAllReviews();
	const reviews = await ReviewApplication.fillReviews(reviewsRaw);

	const courses = await CourseService.getAllCourses();
	const professors = await ProfessorService.getAllProfessors();

	return {
		reviews: JSON.stringify(reviews),
		courses: JSON.stringify(courses),
		professors: JSON.stringify(professors)
	};
};
