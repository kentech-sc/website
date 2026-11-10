import type { RuleResult } from '$lib/types/general.type.js';
import type { Meetup } from '$lib/types/meetup.type.js';
import type { User } from '$lib/types/user.type.js';

import { hasCapability, isOwner } from '$lib/shared/permission.js';
import { APP_ERROR, ok, ruleFail } from '$lib/shared/rule.js';

export function canUseMeetup(user: User): RuleResult {
	if (hasCapability(user, 'meetup.use')) return ok();
	return ruleFail(APP_ERROR.FORBIDDEN, '일정 조율은 로그인 후 이용할 수 있습니다.');
}

export function canDeleteMeetup(meetup: Meetup, user: User): RuleResult {
	if (isOwner(user, meetup.creatorId)) return ok();
	return ruleFail(APP_ERROR.FORBIDDEN, '조율을 만든 사람만 삭제할 수 있습니다.');
}
