import type { ReviewEntity } from '$lib/types/review.type.js';
import type { User } from '$lib/types/user.type.js';

import { hasCapability, isOwner } from '$lib/shared/permission.js';
import { APP_ERROR, ok, ruleFail, type RuleResult } from '$lib/shared/rule.js';

type ReviewScore = {
	assignment: number;
	lecture: number;
	exam: number;
	satisfaction: number;
};

export function canCreateReview(user: User): RuleResult {
	if (hasCapability(user, 'review.write')) return ok();
	return ruleFail(APP_ERROR.FORBIDDEN, '리뷰를 작성할 권한이 없습니다.');
}

export function canEditOrDeleteReview(review: ReviewEntity, user: User): RuleResult {
	if (isOwner(user, review.userId) || hasCapability(user, 'review.moderate')) return ok();
	return ruleFail(APP_ERROR.FORBIDDEN, '리뷰를 수정하거나 삭제할 권한이 없습니다.');
}

export function validateReviewYearAndTerm(year: number, term: number): RuleResult {
	const years = Array.from({ length: new Date().getFullYear() - 2021 }, (_, i) => 22 + i);
	if (years.includes(year) && term >= 1 && term <= 4) return ok();
	return ruleFail(APP_ERROR.BAD_REQUEST, '연도 또는 학기 값이 올바르지 않습니다.');
}

export function validateReviewScore(score: ReviewScore): RuleResult {
	for (const value of Object.values(score)) {
		if (value < 1 || value > 10) {
			return ruleFail(APP_ERROR.BAD_REQUEST, '점수는 1에서 10 사이의 값이어야 합니다.');
		}
	}

	return ok();
}
