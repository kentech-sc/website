import type { User, UserGroup } from '$lib/types/user.type.js';

import { hasCapability } from '$lib/shared/permission.js';

import * as FileMetaService from '$lib/services/file-meta.service.js';
import * as UserService from '$lib/services/user.service.js';

export function getProfilePermissions(user: User) {
	return {
		canManageUsers: hasCapability(user, 'user.manage'),
		canCleanup: hasCapability(user, 'system.cleanup')
	};
}

export async function changeNickname(userId: string, nickname: string, operator: User) {
	return await UserService.changeNicknameById(userId, nickname, operator);
}

export async function changeGroup(email: string, group: UserGroup, operator: User) {
	return await UserService.changeGroupByEmail(email, group, operator);
}

export async function blockUser(email: string, operator: User, duration: number) {
	return await UserService.blockUserByEmail(email, operator, duration);
}

export async function unblockUser(email: string, operator: User) {
	return await UserService.unblockUserByEmail(email, operator);
}

export async function deleteUser(operator: User) {
	await UserService.deleteUser(operator);
}

export async function cleanup(hours: number, user: User) {
	return await FileMetaService.cleanupOrphanedFiles(hours, user);
}
