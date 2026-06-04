import { redirect } from '@sveltejs/kit';

import { withActionErrorHandling, withLoadErrorHandling } from '$lib/server/errors.js';
import * as SearchUsecase from '$lib/usecase/search.usecase.js';

export const load = withLoadErrorHandling(async ({ url }) => {
	const query = url.searchParams.get('query') ?? '';
	const page = Math.max(1, Number(url.searchParams.get('page') ?? 1) || 1);
	const limit = 10;

	const { results, more } = await SearchUsecase.search(query, page, limit);

	return { results, query, page, limit, more };
});

export const actions = {
	search: withActionErrorHandling(async ({ request }) => {
		const formData = await request.formData();
		const query = (formData.get('query') ?? '').toString();
		const searchParams = new URLSearchParams({ query });
		throw redirect(303, `/search?${searchParams.toString()}`);
	})
};
