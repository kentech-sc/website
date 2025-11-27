import { redirect } from '@sveltejs/kit';
import * as SearchApplication from '$lib/app/search.app.js';

import { withActionErrorHandling, withLoadErrorHandling } from '$lib/common/errors.js';

export const load = withLoadErrorHandling(async ({ url }) => {
	const query = url.searchParams.get('query');
	const page = Number(url.searchParams.get('page') ?? 1);

	const limit = 10;

	const { results, more } = await SearchApplication.search(query ?? '', page, limit);

	return { results: JSON.stringify(results), query, page, limit, more };
});

export const actions = {
	search: withActionErrorHandling(async ({ request }) => {
		const formData = await request.formData();
		const query = (formData.get('query') ?? '').toString();
		redirect(303, `/search?query=${query}`);
	})
};
