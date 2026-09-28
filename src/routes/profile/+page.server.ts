import type { PageServerLoad } from './$types.js';

import { withActionErrorHandling } from '$lib/server/errors.js';
import * as ProfileUsecase from '$lib/usecase/profile.usecase.js';

export const load: PageServerLoad = async () => ({});

export const actions = {
	changeResidence: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		await ProfileUsecase.changeResidence(
			(formData.get('gender') ?? '').toString(),
			(formData.get('house') ?? '').toString(),
			locals.user
		);
		return { saved: true };
	}),
	changeNickname: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const nickname = (formData.get('nickname') ?? '').toString();
		await ProfileUsecase.changeNickname(locals.user.id, nickname, locals.user);
		return { nickname };
	}),
	deleteUser: withActionErrorHandling(async ({ locals }) => {
		await ProfileUsecase.deleteUser(locals.user);
		return { userId: locals.user.id };
	})
};
