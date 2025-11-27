import * as UserService from '$lib/srv/user.srv.js';
import type { UserGroup } from '$lib/types/user.type.js';

import { withActionErrorHandling } from '$lib/common/errors.js';

// The below line is essential to prevent rendering the page without server request which leads to skipping the server hooks.
export const load = () => {};

export const actions = {
	changeNickname: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const nickname = (formData.get('nickname') ?? '').toString();
		await UserService.changeNicknameByEmail(locals.user.email, nickname, locals.user);
		return { nickname };
	}),
	changeGroup: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const email = (formData.get('email') ?? '').toString();
		const group = (formData.get('group') ?? '').toString();
		await UserService.changeGroupByEmail(email, group as UserGroup, locals.user);
		return { email, group };
	}),
	blockUser: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const email = (formData.get('email') ?? '').toString();
		const duration = Number(formData.get('duration')) * 60 * 1000;
		await UserService.blockUserByEmail(email, locals.user, duration);
		return { email };
	}),
	unblockUser: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const email = (formData.get('email') ?? '').toString();
		await UserService.unblockUserByEmail(email, locals.user);
		return { email };
	})
};
