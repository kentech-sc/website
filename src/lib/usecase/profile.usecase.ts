import type { User, UserGroup, UserId } from '$lib/types/user.type.js';

import * as AcademicRepository from '$lib/repositories/academic.repository.js';
import { transaction } from '$lib/server/db.js';
import * as FileMetaService from '$lib/services/file-meta.service.js';
import * as UserService from '$lib/services/user.service.js';
import { hasCapability } from '$lib/shared/permission.js';

export function getProfilePermissions(user: User) {
	return {
		canManageUsers: hasCapability(user, 'user.manage'),
		canCleanup: hasCapability(user, 'system.cleanup')
	};
}

export async function getUserAdminOptions(user: User) {
	if (!hasCapability(user, 'user.manage')) return [];
	return await UserService.findUserAdminOptions();
}

export async function changeNickname(userId: string, nickname: string, operator: User) {
	return await UserService.changeNicknameById(userId, nickname, operator);
}

export async function changeGroupById(userId: UserId, group: UserGroup, operator: User) {
	return await UserService.changeGroupById(userId, group, operator);
}

export async function blockUserById(userId: UserId, operator: User, duration: number) {
	return await UserService.blockUserById(userId, operator, duration);
}

export async function unblockUserById(userId: UserId, operator: User) {
	return await UserService.unblockUserById(userId, operator);
}

export async function deleteUser(operator: User) {
	await transaction(async () => {
		await AcademicRepository.deleteStudentData(operator.id);
		await UserService.deleteUser(operator);
	});
}

export async function cleanup(hours: number, user: User) {
	return await FileMetaService.cleanupOrphanedFiles(hours, user);
}
