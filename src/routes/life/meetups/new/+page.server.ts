import { redirect } from '@sveltejs/kit';

import { withActionErrorHandling } from '$lib/server/errors.js';
import * as MeetupUsecase from '$lib/usecase/meetup.usecase.js';

export const load = () => {};

export const actions = {
	create: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const meetup = await MeetupUsecase.create(
			{
				title: String(formData.get('title') ?? ''),
				mode: String(formData.get('mode') ?? ''),
				days: formData.getAll('days').map(String),
				startMinute: Number(formData.get('startHour')) * 60,
				endMinute: Number(formData.get('endHour')) * 60
			},
			locals.user
		);
		throw redirect(303, `/life/meetups/${meetup.id}`);
	})
};
