import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { FileStorage } from '$lib/common/storage.js';

export const GET: RequestHandler = async ({ url }) => {
	const key = url.searchParams.get('key');
	if (!key || !key.startsWith('files/')) throw error(400);

	try {
		const bytes = await FileStorage.getFileBytes(key);
		return new Response(bytes.buffer as ArrayBuffer, {
			headers: {
				'Content-Type': 'application/pdf',
				'Cache-Control': 'private, max-age=3600'
			}
		});
	} catch {
		throw error(502);
	}
};
