import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { FileStorage } from '$lib/common/storage.js';
import { SrvError } from '$lib/common/errors.js';

export const GET: RequestHandler = async ({ url }) => {
	const key = url.searchParams.get('key');
	if (!key || !key.startsWith('files/')) throw error(400);

	let file: Awaited<ReturnType<typeof FileStorage.getFileStream>>;
	try {
		file = await FileStorage.getFileStream(key);
	} catch (err) {
		// 존재하지 않는 키는 404, 그 외 S3 통신 오류는 502
		if (err instanceof SrvError || (err as { name?: string })?.name === 'NoSuchKey')
			throw error(404);
		throw error(502);
	}

	return new Response(file.stream, {
		headers: {
			'Content-Type': file.contentType ?? 'application/pdf',
			...(file.contentLength ? { 'Content-Length': String(file.contentLength) } : {}),
			'Cache-Control': 'private, max-age=3600'
		}
	});
};
