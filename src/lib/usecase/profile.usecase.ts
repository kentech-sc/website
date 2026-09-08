import type { User, UserGroup, UserId } from '$lib/types/user.type.js';

import * as AcademicRepository from '$lib/repositories/academic.repository.js';
import { transaction } from '$lib/server/db.js';
import { AppError } from '$lib/server/errors.js';
import * as Push from '$lib/server/push.js';
import * as BannerService from '$lib/services/banner.service.js';
import * as FileMetaService from '$lib/services/file-meta.service.js';
import * as UserService from '$lib/services/user.service.js';
import { hasCapability } from '$lib/shared/permission.js';
import { APP_ERROR } from '$lib/shared/rule.js';

export function getProfilePermissions(user: User) {
	return {
		canManageUsers: hasCapability(user, 'user.manage'),
		canSendPush: hasCapability(user, 'push.send'),
		canManageBanner: hasCapability(user, 'banner.manage'),
		canCleanup: hasCapability(user, 'system.cleanup')
	};
}

export async function sendPushNotification(titleInput: string, bodyInput: string, user: User) {
	if (!hasCapability(user, 'push.send')) {
		throw new AppError(APP_ERROR.FORBIDDEN, '푸시 알림을 발송할 권한이 없습니다.');
	}

	const title = titleInput.trim();
	const body = bodyInput.trim();
	if (!title || !body) {
		throw new AppError(APP_ERROR.BAD_REQUEST, '제목과 내용을 모두 입력해 주세요.');
	}
	if (title.length > 80 || body.length > 500) {
		throw new AppError(APP_ERROR.BAD_REQUEST, '제목은 80자, 내용은 500자 이내로 입력해 주세요.');
	}

	return await Push.sendPushToAllSubscribers({ title, body, url: '/' });
}

/** 관리 화면에서 지금 걸린 배너를 보여주기 위한 조회. */
export async function getManagedBanners(user: User) {
	if (!hasCapability(user, 'banner.manage')) return [];

	// 마이그레이션이 배포보다 늦으면 테이블이 없어 조회가 실패한다. 그래도 프로필은 떠야 한다.
	try {
		return await BannerService.findBanners(user);
	} catch {
		return [];
	}
}

export async function addBanner(fileId: string, linkUrl: string | null, user: User) {
	return await BannerService.addBanner(fileId, linkUrl, user);
}

export async function activateBanner(bannerId: string, user: User) {
	return await BannerService.activateBanner(bannerId, user);
}

export async function removeBanner(bannerId: string, user: User) {
	return await BannerService.deleteBanner(bannerId, user);
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
