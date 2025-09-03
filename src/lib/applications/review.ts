import type { Review } from '../review/types';
import UserService from '$lib/user/service';
import CourseService from '$lib/course/service';
import ProfessorService from '$lib/professor/service';

export default class ReviewApplication {
	static async fillReviews(reviews: Review[]) {
		reviews = await UserService.fillDisplayNamesByDisplayType(reviews, 'nickname');
		reviews = await CourseService.fillCourseInfosByCourseIds(reviews);
		reviews = await ProfessorService.fillProfessorNamesByProfessorIds(reviews);
		return reviews;
	}
}
