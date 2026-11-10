import { redirect } from '@sveltejs/kit';

import { withActionErrorHandling, withLoadErrorHandling } from '$lib/server/errors.js';
import * as MeetupUsecase from '$lib/usecase/meetup.usecase.js';

/** 쉼표로 이은 칸 번호. 빈 문자열은 가능한 시간이 없다는 응답이다. */
function readSlots(value: FormDataEntryValue | null): number[] {
	const text = String(value ?? '').trim();
	return text ? text.split(',').map(Number) : [];
}

export const load = withLoadErrorHandling(async ({ params, locals }) => {
	return await MeetupUsecase.getDetailPage(String(params.meetupId), locals.user);
});

export const actions = {
	respond: withActionErrorHandling(async ({ params, request, locals }) => {
		const formData = await request.formData();
		await MeetupUsecase.respond(
			String(params.meetupId),
			readSlots(formData.get('slots')),
			locals.user
		);
	}),
	delete: withActionErrorHandling(async ({ params, locals }) => {
		await MeetupUsecase.remove(String(params.meetupId), locals.user);
		throw redirect(303, '/life/meetups');
	})
};
