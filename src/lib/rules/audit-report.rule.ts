import type { RuleResult } from '$lib/types/general.type.js';
import type { User } from '$lib/types/user.type.js';

import { hasCapability } from '$lib/shared/permission.js';
import { APP_ERROR, ok, ruleFail } from '$lib/shared/rule.js';

export function canCreateAuditReport(user: User): RuleResult {
	return hasCapability(user, 'audit.write')
		? ok()
		: ruleFail(APP_ERROR.FORBIDDEN, '감사원 제보를 작성할 권한이 없습니다.');
}

export function canReadAuditReport(user: User): RuleResult {
	return hasCapability(user, 'audit.read')
		? ok()
		: ruleFail(APP_ERROR.FORBIDDEN, '감사원만 제보를 열람할 수 있습니다.');
}

export function canManageAuditReport(user: User): RuleResult {
	return hasCapability(user, 'audit.manage')
		? ok()
		: ruleFail(APP_ERROR.FORBIDDEN, '감사원만 제보 상태를 변경할 수 있습니다.');
}
