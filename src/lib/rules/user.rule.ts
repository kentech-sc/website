import { RuleError } from '$lib/common/errors.js';
import type { User } from '$lib/types/user.type.js';
import { UserGroup } from '$lib/types/user.type.js';

export function canChangeNickname(
	targetUser: User,
	newNickname: string,
	operatorUser: User,
	isDuplicate: boolean
): boolean {
	newNickname = newNickname.trim();
	if (
		!(
			targetUser.email === operatorUser.email ||
			([UserGroup.Dev, UserGroup.Manager] as UserGroup[]).includes(operatorUser.group)
		)
	)
		throw new RuleError('이름 변경은 본인만 가능합니다.');
	if (newNickname.length < 4) throw new RuleError('별명은 4자 이상이어야 합니다.');
	if (targetUser.nickname === newNickname) throw new RuleError('변경 사항이 없습니다.');
	if (isDuplicate) throw new RuleError('이미 같은 별명의 사용자가 있습니다.');
	return true;
}

export function canChangeGroup(targetUser: User, newGroup: UserGroup, operatorUser: User): boolean {
	if (!([UserGroup.User, UserGroup.Moderator, UserGroup.Manager] as UserGroup[]).includes(newGroup))
		throw new RuleError('그룹 변경은 "user", "moderator", "manager"로만 가능합니다.');

	if (!([UserGroup.Manager, UserGroup.Dev] as UserGroup[]).includes(operatorUser.group))
		throw new RuleError('그룹 변경 권한이 없습니다.');

	if (([UserGroup.Dev] as UserGroup[]).includes(targetUser.group))
		throw new RuleError('개발자의 그룹은 변경할 수 없습니다.');

	return true;
}

export function canBlockOrUnblockUser(targetUser: User, operatorUser: User): boolean {
	if (([UserGroup.Manager, UserGroup.Dev] as UserGroup[]).includes(targetUser.group))
		throw new RuleError('관리자나 개발자는 차단 또는 차단 해제할 수 없습니다.');
	if (!([UserGroup.Manager, UserGroup.Dev] as UserGroup[]).includes(operatorUser.group))
		throw new RuleError('차단 또는 차단 해제 권한이 없습니다.');
	return true;
}
