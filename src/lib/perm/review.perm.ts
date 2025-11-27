import type { Review } from '$lib/types/review.type.js';
import type { User } from '$lib/types/user.type.js';
import { UserGroup } from '$lib/types/user.type.js';

export function canEditOrDeleteReview(review: Review, user: User): boolean {
	return review.userId.equals(user._id) || user.group === UserGroup.Manager;
}

export function checkReviewYearAndTerm(year: number, term: number): boolean {
	const years = Array.from({ length: new Date().getFullYear() - 2021 }, (_, i) => 22 + i);
	if (years.indexOf(year) === -1 || term < 1 || term > 4) return false;
	return true;
}

export function checkReviewScore(score: {
	assignment: number;
	lecture: number;
	exam: number;
}): boolean {
	for (const key in score) {
		if (score[key as keyof typeof score] < 1 || score[key as keyof typeof score] > 10) return false;
	}
	return true;
}
