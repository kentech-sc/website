import type { UserGroup } from '$lib/types/user.type.js';
import type { PageServerLoad } from './$types.js';

import { withActionErrorHandling } from '$lib/server/errors.js';
import * as ProfileUsecase from '$lib/usecase/profile.usecase.js';

export const load: PageServerLoad = async ({ locals }) => {
	return {
		permissions: ProfileUsecase.getProfilePermissions(locals.user),
		userAdminOptions: await ProfileUsecase.getUserAdminOptions(locals.user)
	};
};

export const actions = {
	changeNickname: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const nickname = (formData.get('nickname') ?? '').toString();
		await ProfileUsecase.changeNickname(locals.user.id, nickname, locals.user);
		return { nickname };
	}),
	changeGroup: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const userId = (formData.get('user-id') ?? '').toString();
		const group = (formData.get('group') ?? '').toString();
		await ProfileUsecase.changeGroupById(userId, group as UserGroup, locals.user);
		return { userId, group };
	}),
	blockUser: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const userId = (formData.get('user-id') ?? '').toString();
		const duration = Number(formData.get('duration')) * 60 * 1000;
		await ProfileUsecase.blockUserById(userId, locals.user, duration);
		return { userId };
	}),
	unblockUser: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const userId = (formData.get('user-id') ?? '').toString();
		await ProfileUsecase.unblockUserById(userId, locals.user);
		return { userId };
	}),
	deleteUser: withActionErrorHandling(async ({ locals }) => {
		await ProfileUsecase.deleteUser(locals.user);
		return { userId: locals.user.id };
	}),
	cleanup: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const hours = Number(formData.get('hours') ?? 24);
		const deletedCnt = await ProfileUsecase.cleanup(hours, locals.user);
		return { deletedCnt };
	})
};
