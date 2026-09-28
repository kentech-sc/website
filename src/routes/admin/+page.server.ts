import type { UserGroup } from '$lib/types/user.type.js';

import { editorActions } from '$lib/server/editor.js';
import {
	AppError,
	APP_ERROR,
	withActionErrorHandling,
	withLoadErrorHandling
} from '$lib/server/errors.js';
import * as AdminUsecase from '$lib/usecase/admin.usecase.js';

export const load = withLoadErrorHandling(async ({ locals }) => {
	const permissions = AdminUsecase.getAdminPermissions(locals.user);
	if (
		!permissions.canSendPush &&
		!permissions.canManageUsers &&
		!permissions.canManageBanner &&
		!permissions.canCleanup
	) {
		throw new AppError(APP_ERROR.FORBIDDEN, '사이트를 관리할 권한이 없습니다.');
	}

	return {
		permissions,
		userAdminOptions: await AdminUsecase.getUserAdminOptions(locals.user),
		banners: await AdminUsecase.getManagedBanners(locals.user)
	};
});

export const actions = {
	...editorActions,
	addBanner: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const fileId = String(formData.get('file-id') ?? '');
		const linkUrl = String(formData.get('link-url') ?? '');
		await AdminUsecase.addBanner(fileId, linkUrl, locals.user);
		return { fileId };
	}),
	setBannerActive: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const bannerId = String(formData.get('banner-id') ?? '');
		await AdminUsecase.setBannerActive(bannerId, formData.get('is-active') === 'true', locals.user);
		return { bannerId };
	}),
	reorderBanners: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const bannerIds = String(formData.get('banner-ids') ?? '')
			.split(',')
			.filter(Boolean);
		await AdminUsecase.reorderBanners(bannerIds, locals.user);
		return { bannerIds };
	}),
	removeBanner: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const bannerId = String(formData.get('banner-id') ?? '');
		await AdminUsecase.removeBanner(bannerId, locals.user);
		return { bannerId };
	}),
	changeGroup: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const userId = String(formData.get('user-id') ?? '');
		const group = String(formData.get('group') ?? '') as UserGroup;
		await AdminUsecase.changeGroupById(userId, group, locals.user);
		return { userId, group };
	}),
	blockUser: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const userId = String(formData.get('user-id') ?? '');
		await AdminUsecase.blockUserById(
			userId,
			locals.user,
			Number(formData.get('duration')) * 60 * 1000
		);
		return { userId };
	}),
	unblockUser: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const userId = String(formData.get('user-id') ?? '');
		await AdminUsecase.unblockUserById(userId, locals.user);
		return { userId };
	}),
	cleanup: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const deletedCount = await AdminUsecase.cleanup(
			Number(formData.get('hours') ?? 24),
			locals.user
		);
		return { deletedCount };
	}),
	sendPush: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const result = await AdminUsecase.sendPushNotification(
			String(formData.get('title') ?? ''),
			String(formData.get('body') ?? ''),
			locals.user
		);
		return { pushResult: result };
	})
};
