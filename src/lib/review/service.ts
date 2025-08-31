import type { Review } from './types';
import UserManager from '$lib/user/manager';
import CourseManager from '$lib/course/manager';
import ProfessorManager from '$lib/professor/manager';

export default class ReviewService {
	static async fillReviews(reviews: Review[]) {
		reviews = await UserManager.fillDisplayNamesByDisplayType(reviews, 'nickname');
		reviews = await CourseManager.fillCourseInfosByCourseIds(reviews);
		reviews = await ProfessorManager.fillProfessorNamesByProfessorIds(reviews);
		return reviews;
	}
}
