import type { UserGroup } from '$lib/types/user.type.js';
import type { PageServerLoad } from './$types.js';

import { withActionErrorHandling } from '$lib/server/errors.js';
import * as ProfileUsecase from '$lib/usecase/profile.usecase.js';

export const load: PageServerLoad = ({ locals }) => {
	return {
		permissions: ProfileUsecase.getProfilePermissions(locals.user)
	};
};

export const actions = {
	changeNickname: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const nickname = (formData.get('nickname') ?? '').toString();
		await ProfileUsecase.changeNickname(locals.user._id, nickname, locals.user);
		return { nickname };
	}),
	changeGroup: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const email = (formData.get('email') ?? '').toString();
		const group = (formData.get('group') ?? '').toString();
		await ProfileUsecase.changeGroup(email, group as UserGroup, locals.user);
		return { email, group };
	}),
	blockUser: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const email = (formData.get('email') ?? '').toString();
		const duration = Number(formData.get('duration')) * 60 * 1000;
		await ProfileUsecase.blockUser(email, locals.user, duration);
		return { email };
	}),
	unblockUser: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const email = (formData.get('email') ?? '').toString();
		await ProfileUsecase.unblockUser(email, locals.user);
		return { email };
	}),
	deleteUser: withActionErrorHandling(async ({ locals }) => {
		await ProfileUsecase.deleteUser(locals.user);
		return { userId: locals.user._id };
	}),
	cleanup: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const hours = Number(formData.get('hours') ?? 24);
		const deletedCnt = await ProfileUsecase.cleanup(hours, locals.user);
		return { deletedCnt };
	})
};
