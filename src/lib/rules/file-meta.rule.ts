import type { User } from '$lib/types/user.type.js';
import { hasCapability } from '$lib/shared/permission.js';
import { APP_ERROR, ok, ruleFail, type RuleResult } from '$lib/shared/rule.js';

export function canCleanupOrphanedFiles(user: User): RuleResult {
	if (hasCapability(user, 'system.cleanup')) return ok();
	return ruleFail(APP_ERROR.FORBIDDEN, '정리 작업을 실행할 권한이 없습니다.');
}
