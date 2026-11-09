import { resolve } from '$app/paths';

export async function postGame(body: unknown, keepalive = false) {
	const response = await fetch(resolve('/api/games'), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
		keepalive
	});
	const result = await response.json();
	if (!response.ok) throw new Error(result.message ?? result.error?.message ?? '요청 처리 실패');
	return result;
}
