import { redirect } from '@sveltejs/kit';

import { withActionErrorHandling, withLoadErrorHandling } from '$lib/server/errors.js';
import * as TimetableUsecase from '$lib/usecase/timetable.usecase.js';

function currentTerm() {
	const now = new Date();
	return { year: now.getFullYear(), term: now.getMonth() < 6 ? 1 : 2 };
}

export const load = withLoadErrorHandling(async ({ url, locals }) => {
	const fallback = currentTerm();
	const year = Number(url.searchParams.get('year')) || fallback.year;
	const term = Number(url.searchParams.get('term')) || fallback.term;
	return { ...(await TimetableUsecase.getPage(year, term, locals.user)), year, term };
});

export const actions = {
	create: withActionErrorHandling(async ({ request, locals }) => {
		const data = await request.formData();
		await TimetableUsecase.create(
			Number(data.get('year')),
			Number(data.get('term')),
			String(data.get('name') ?? ''),
			locals.user
		);
	}),
	add: withActionErrorHandling(async ({ request, locals }) => {
		const data = await request.formData();
		await TimetableUsecase.addOffering(
			String(data.get('timetableId')),
			String(data.get('offeringId')),
			locals.user
		);
	}),
	removeItem: withActionErrorHandling(async ({ request, locals }) => {
		const data = await request.formData();
		await TimetableUsecase.removeOffering(
			String(data.get('timetableId')),
			String(data.get('offeringId')),
			locals.user
		);
	}),
	copy: withActionErrorHandling(async ({ request, locals }) => {
		const data = await request.formData();
		await TimetableUsecase.copy(String(data.get('timetableId')), locals.user);
	}),
	confirm: withActionErrorHandling(async ({ request, locals }) => {
		const data = await request.formData();
		await TimetableUsecase.confirm(String(data.get('timetableId')), locals.user);
	}),
	unconfirm: withActionErrorHandling(async ({ request, locals }) => {
		const data = await request.formData();
		await TimetableUsecase.unconfirm(String(data.get('timetableId')), locals.user);
	}),
	rename: withActionErrorHandling(async ({ request, locals }) => {
		const data = await request.formData();
		await TimetableUsecase.rename(
			String(data.get('timetableId')),
			String(data.get('name')),
			locals.user
		);
	}),
	delete: withActionErrorHandling(async ({ request, locals, url }) => {
		const data = await request.formData();
		await TimetableUsecase.remove(String(data.get('timetableId')), locals.user);
		throw redirect(
			303,
			`/timetable?year=${url.searchParams.get('year') ?? ''}&term=${url.searchParams.get('term') ?? ''}`
		);
	})
};
