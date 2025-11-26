import * as UserService from '$lib/srv/user.srv.js';
import type { UserGroup } from '$lib/types/user.type.js';

import { fail, redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	if (locals.user.group === 'guest') {
		redirect(303, '/signin');
	}
}

export const actions = {
	changeNickname: async ({ request, locals }) => {
		try {
			const formData = await request.formData();
			const nickname = (formData.get('nickname') ?? '').toString();
			await UserService.changeNicknameByEmail(locals.user.email, nickname, locals.user);
			return { nickname };
		} catch (error) {
			if (error instanceof Error) return fail(400, { message: error.message });
			throw error;
		}
	},
	changeGroup: async ({ request, locals }) => {
		try {
			const formData = await request.formData();
			const email = (formData.get('email') ?? '').toString();
			const group = (formData.get('group') ?? '').toString();
			await UserService.changeGroupByEmail(email, group as UserGroup, locals.user);
			return { email, group };
		} catch (error) {
			if (error instanceof Error) return fail(400, { message: error.message });
			throw error;
		}
	},
	blockUser: async ({ request, locals }) => {
		try {
			const formData = await request.formData();
			const email = (formData.get('email') ?? '').toString();
			const duration = Number(formData.get('duration')) * 60 * 1000;
			await UserService.blockUserByEmail(email, locals.user, duration);
			return { email };
		} catch (error) {
			if (error instanceof Error) return fail(400, { message: error.message });
			throw error;
		}
	},
	unblockUser: async ({ request, locals }) => {
		try {
			const formData = await request.formData();
			const email = (formData.get('email') ?? '').toString();
			await UserService.unblockUserByEmail(email, locals.user);
			return { email };
		} catch (error) {
			if (error instanceof Error) return fail(400, { message: error.message });
			throw error;
		}
	}
};
