import type { RequestHandler } from './$types.js';

import { KIS_COMPLETION_EXTRACTOR } from '$lib/shared/portal-completion-import.js';

export const GET: RequestHandler = () => {
	return new Response(KIS_COMPLETION_EXTRACTOR, {
		headers: {
			'content-type': 'application/javascript; charset=utf-8',
			'cache-control': 'public, max-age=0, must-revalidate'
		}
	});
};
