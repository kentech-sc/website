import UserService from '$lib/user/service';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	if (locals.user.group === 'guest') {
		redirect(303, '/signin');
	}
}

export const actions = {
	changeNickname: async ({ request, locals }) => {
		const formData = await request.formData();
		const nickname = (formData.get('nickname') ?? '').toString();
		await UserService.changeNicknameByEmail(locals.user.email, nickname, locals.user);
		return { nickname };
	},
	blockUser: async ({ request, locals }) => {
		const formData = await request.formData();
		const email = (formData.get('email') ?? '').toString();
		const duration = Number(formData.get('duration')) * 60 * 1000;
		await UserService.blockUserByEmail(email, locals.user, duration);
		return { email };
	},
	unblockUser: async ({ request, locals }) => {
		const formData = await request.formData();
		const email = (formData.get('email') ?? '').toString();
		await UserService.unblockUserByEmail(email, locals.user);
		return { email };
	}
};
