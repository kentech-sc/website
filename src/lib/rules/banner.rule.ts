import type { RuleResult } from '$lib/types/general.type.js';
import type { User } from '$lib/types/user.type.js';

import { hasCapability } from '$lib/shared/permission.js';
import { APP_ERROR, ok, ruleFail } from '$lib/shared/rule.js';

export function canManageBanner(user: User): RuleResult {
	if (hasCapability(user, 'banner.manage')) return ok();
	return ruleFail(APP_ERROR.FORBIDDEN, '배너를 관리할 권한이 없습니다.');
}
