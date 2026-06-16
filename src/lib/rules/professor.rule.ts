import type { RuleResult } from '$lib/types/general.type.js';
import type { User } from '$lib/types/user.type.js';

import { hasCapability } from '$lib/shared/permission.js';
import { APP_ERROR, ok, ruleFail } from '$lib/shared/rule.js';

export function canManageProfessor(user: User): RuleResult {
	if (hasCapability(user, 'professor.manage')) return ok();
	return ruleFail(APP_ERROR.FORBIDDEN, '교수 정보를 관리할 권한이 없습니다.');
}

export function validateProfessorCreate(isDuplicate: boolean): RuleResult {
	if (!isDuplicate) return ok();
	return ruleFail(APP_ERROR.CONFLICT, '이미 존재하는 교수입니다.');
}
