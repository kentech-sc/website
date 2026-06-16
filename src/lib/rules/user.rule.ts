import type { RuleResult } from '$lib/types/general.type.js';
import type { User } from '$lib/types/user.type.js';

import { hasCapability, isOwner } from '$lib/shared/permission.js';
import { APP_ERROR, ok, ruleFail } from '$lib/shared/rule.js';
import { UserGroup, type UserGroup as UserGroupType } from '$lib/types/user.type.js';

const validNicknameRegex = /^[가-힣a-zA-Z0-9 ]+$/;
const continuousSpaceRegex = /\s{2,}/;
const allowedGroups: UserGroupType[] = [UserGroup.User, UserGroup.Moderator, UserGroup.Manager];
const protectedGroups: UserGroupType[] = [UserGroup.Manager, UserGroup.Dev];

export function canSignup(existingUser: User | null): RuleResult {
	if (!existingUser) return ok();
	return ruleFail(APP_ERROR.CONFLICT, '이미 가입한 사용자입니다.');
}

export function canChangeNickname(
	targetUser: User,
	newNickname: string,
	operatorUser: User,
	isDuplicate: boolean
): RuleResult {
	if (!(isOwner(operatorUser, targetUser._id) || hasCapability(operatorUser, 'user.manage'))) {
		return ruleFail(APP_ERROR.FORBIDDEN, '별명을 변경할 권한이 없습니다.');
	}

	if (newNickname.trim() !== newNickname) {
		return ruleFail(APP_ERROR.BAD_REQUEST, '별명 앞뒤 공백을 제거해 주세요.');
	}

	if (continuousSpaceRegex.test(newNickname)) {
		return ruleFail(APP_ERROR.BAD_REQUEST, '공백은 연속해서 사용할 수 없습니다.');
	}

	if (!validNicknameRegex.test(newNickname)) {
		return ruleFail(APP_ERROR.BAD_REQUEST, '별명은 한글, 영문, 숫자만 사용할 수 있습니다.');
	}

	if (newNickname.length < 4 || newNickname.length > 20) {
		return ruleFail(APP_ERROR.BAD_REQUEST, '별명은 4자 이상 20자 이하여야 합니다.');
	}

	if (targetUser.nickname === newNickname) {
		return ruleFail(APP_ERROR.CONFLICT, '변경 사항이 없습니다.');
	}

	if (isDuplicate) {
		return ruleFail(APP_ERROR.CONFLICT, '이미 같은 별명을 사용하는 사용자가 있습니다.');
	}

	return ok();
}

export function canChangeGroup(
	targetUser: User,
	newGroup: UserGroupType,
	operatorUser: User
): RuleResult {
	if (!allowedGroups.includes(newGroup)) {
		return ruleFail(
			APP_ERROR.BAD_REQUEST,
			'그룹은 user, moderator, manager 중 하나로만 변경할 수 있습니다.'
		);
	}

	if (!hasCapability(operatorUser, 'user.manage')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '그룹을 변경할 권한이 없습니다.');
	}

	if (targetUser.group === UserGroup.Dev) {
		return ruleFail(APP_ERROR.FORBIDDEN, '개발자 그룹은 변경할 수 없습니다.');
	}

	return ok();
}

export function canBlockOrUnblockUser(targetUser: User, operatorUser: User): RuleResult {
	if (!hasCapability(operatorUser, 'user.manage')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '사용자를 차단하거나 해제할 권한이 없습니다.');
	}

	if (protectedGroups.includes(targetUser.group)) {
		return ruleFail(APP_ERROR.FORBIDDEN, '관리자와 개발자는 차단하거나 해제할 수 없습니다.');
	}

	return ok();
}

export function canDeleteUser(targetUser: User, operatorUser: User): RuleResult {
	if (isOwner(operatorUser, targetUser._id)) return ok();
	return ruleFail(APP_ERROR.FORBIDDEN, '사용자 탈퇴는 본인만 할 수 있습니다.');
}
