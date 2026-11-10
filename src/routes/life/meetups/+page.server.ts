import { withLoadErrorHandling } from '$lib/server/errors.js';
import * as MeetupUsecase from '$lib/usecase/meetup.usecase.js';

export const load = withLoadErrorHandling(async ({ locals }) => {
	return await MeetupUsecase.getListPage(locals.user);
});
