import type { User } from '$lib/types/user.type.js';

import { hasCapability } from '$lib/shared/permission.js';
import { APP_ERROR, ok, ruleFail, type RuleResult } from '$lib/shared/rule.js';

export function canManageCourse(user: User): RuleResult {
	if (hasCapability(user, 'course.manage')) return ok();
	return ruleFail(APP_ERROR.FORBIDDEN, '강의를 관리할 권한이 없습니다.');
}

export function validateCourseCreate(isDuplicate: boolean): RuleResult {
	if (!isDuplicate) return ok();
	return ruleFail(APP_ERROR.CONFLICT, '이미 존재하는 강의입니다.');
}
