import type { User } from '$lib/types/user.type.js';

import { APP_ERROR, ok, ruleFail } from '$lib/shared/rule.js';

export function canRecordGame(user: User, now = new Date().toISOString()) {
	if (user.group === 'guest') return ruleFail(APP_ERROR.UNAUTHORIZED, '기록 등록 시 로그인 필요');
	if (user.deletedAt || (user.blockedUntil && user.blockedUntil > now)) {
		return ruleFail(APP_ERROR.FORBIDDEN, '기록 등록 불가 계정');
	}
	return ok();
}
