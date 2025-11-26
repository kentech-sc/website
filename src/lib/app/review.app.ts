import type { Review } from '$lib/types/review.type.js';

import * as CourseService from '$lib/srv/course.srv.js';
import * as ProfessorService from '$lib/srv/prof.srv.js';

export async function fillReviews(reviews: Review[]) {
	reviews = await CourseService.fillCourseInfosByCourseIds(reviews);
	reviews = await ProfessorService.fillProfessorNamesByProfessorIds(reviews);
	return reviews;
}
