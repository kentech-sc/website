import { json } from '@sveltejs/kit';

import { AppError } from '$lib/server/errors.js';
import { isGameId, isGameRunId } from '$lib/shared/games.js';
import { isRecyclingChoice } from '$lib/shared/recycling.js';
import * as GameUsecase from '$lib/usecase/game.usecase.js';

export const POST = async ({ request, locals, url }) => {
	if (request.headers.get('origin') !== url.origin) {
		return json({ message: '허용되지 않은 요청 출처입니다.' }, { status: 403 });
	}
	if (Number(request.headers.get('content-length')) > 8192) {
		return json({ message: '요청이 너무 큽니다.' }, { status: 413 });
	}
	let body: unknown;
	try {
		const text = await request.text();
		if (text.length > 8192) return json({ message: '요청이 너무 큽니다.' }, { status: 413 });
		body = JSON.parse(text);
	} catch {
		return json({ message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
	}
	try {
		if (
			body &&
			typeof body === 'object' &&
			'action' in body &&
			body.action === 'start' &&
			'game' in body &&
			isGameId(body.game)
		) {
			return json(
				{ session: await GameUsecase.startGame(body.game, locals.user) },
				{ headers: { 'Cache-Control': 'no-store' } }
			);
		}
		if (
			body &&
			typeof body === 'object' &&
			'action' in body &&
			'runId' in body &&
			isGameRunId(body.runId)
		) {
			if (body.action === 'reaction-signal') {
				return json(await GameUsecase.openReactionSignal(body.runId, locals.user), {
					headers: { 'Cache-Control': 'no-store' }
				});
			}
			if (body.action === 'reaction-click' && 'token' in body && isGameRunId(body.token)) {
				return json(await GameUsecase.recordReactionClick(body.runId, body.token, locals.user));
			}
			if (
				body.action === 'color-choice' &&
				'token' in body &&
				isGameRunId(body.token) &&
				'index' in body &&
				typeof body.index === 'number' &&
				Number.isInteger(body.index)
			) {
				return json(
					await GameUsecase.recordColorChoice(body.runId, body.token, body.index, locals.user),
					{
						headers: { 'Cache-Control': 'no-store' }
					}
				);
			}
			if (body.action === 'cancel') {
				await GameUsecase.cancelGame(body.runId, locals.user);
				return json({ cancelled: true });
			}
			if (
				body.action === 'recycling-choice' &&
				'token' in body &&
				isGameRunId(body.token) &&
				'bin' in body &&
				isRecyclingChoice(body.bin)
			) {
				return json(
					await GameUsecase.recordRecyclingChoice(body.runId, body.token, body.bin, locals.user),
					{
						headers: { 'Cache-Control': 'no-store' }
					}
				);
			}
			if (body.action === 'finish') {
				return json(await GameUsecase.submitGame(body.runId, locals.user));
			}
		}
		return json({ message: '게임 기록이 올바르지 않습니다.' }, { status: 400 });
	} catch (error) {
		if (error instanceof AppError)
			return json({ message: error.message }, { status: error.status });
		throw error;
	}
};
