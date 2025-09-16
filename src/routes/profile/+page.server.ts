import UserService from '$lib/user/service';
import { error } from '@sveltejs/kit';

export const actions = {
	changeNickname: async ({ request, locals }) => {
		const formData = await request.formData();
		const nickname = (formData.get('nickname') ?? '').toString();
		try {
			await UserService.changeNicknameByEmail(locals.user.email, nickname, locals.user);
			return { nickname };
		} catch (e) {
			if (e instanceof Error) error(400, e.message);
			else error(400, '알 수 없는 오류가 발생했습니다.');
		}
	},
	blockUser: async ({ request, locals }) => {
		const formData = await request.formData();
		const email = (formData.get('email') ?? '').toString();
		const duration = Number(formData.get('duration')) * 60 * 1000;
		try {
			await UserService.blockUserByEmail(email, locals.user, duration);
			return { email };
		} catch (e) {
			if (e instanceof Error) error(400, e.message);
			else error(400, '알 수 없는 오류가 발생했습니다.');
		}
	},
	unblockUser: async ({ request, locals }) => {
		const formData = await request.formData();
		const email = (formData.get('email') ?? '').toString();
		try {
			await UserService.unblockUserByEmail(email, locals.user);
			return { email };
		} catch (e) {
			if (e instanceof Error) error(400, e.message);
			else error(400, '알 수 없는 오류가 발생했습니다.');
		}
	}
};
