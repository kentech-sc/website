import type { RequestHandler } from './$types.js';

import { KIS_RECORD_EXTRACTOR } from '$lib/shared/portal-record-import.js';

export const GET: RequestHandler = () => {
	return new Response(KIS_RECORD_EXTRACTOR, {
		headers: {
			'content-type': 'application/javascript; charset=utf-8',
			'cache-control': 'public, max-age=0, must-revalidate'
		}
	});
};
