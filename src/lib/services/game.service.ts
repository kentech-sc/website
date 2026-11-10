import { randomInt, randomUUID } from 'node:crypto';
import { setTimeout as wait } from 'node:timers/promises';

import type { RecyclingChoice } from '$lib/shared/recycling.js';
import type { GameId, GameSession, RankedColorBoard } from '$lib/types/game.type.js';
import type { User } from '$lib/types/user.type.js';

import * as GameRepository from '$lib/repositories/game.repository.js';
import { canRecordGame } from '$lib/rules/game.rule.js';
import { transaction } from '$lib/server/db.js';
import { AppError, assertRule } from '$lib/server/errors.js';
import {
	calculateReactionScore,
	COLOR_DURATION_MS,
	COLOR_MAX_ROUNDS,
	GAME_SESSION_MS,
	getColorBoard,
	getGameWeek,
	isSuspiciousReaction,
	REACTION_ROUNDS,
	REACTION_WINDOW_MS
} from '$lib/shared/games.js';
import {
	gradeRecyclingChoice,
	pickRecyclingItem,
	RECYCLING_DURATION_MS,
	RECYCLING_ITEMS,
	RECYCLING_MAX_ROUNDS
} from '$lib/shared/recycling.js';
import { APP_ERROR } from '$lib/shared/rule.js';

const NETWORK_GRACE_MS = 1000;

function colorBoard(seed: number, round: number, token: string): RankedColorBoard {
	const { side, target, base, accent } = getColorBoard(seed, round);
	return {
		token,
		side,
		colors: Array.from({ length: side ** 2 }, (_, index) => (index === target ? accent : base))
	};
}

export async function startGame(game: GameId, user: User): Promise<GameSession> {
	assertRule(canRecordGame(user));
	const seed = randomInt(0, 2147483647);
	if (game === 'recycling') {
		const item = RECYCLING_ITEMS[pickRecyclingItem(-1)];
		const token = randomUUID();
		const { id } = await GameRepository.createGameSession(user.id, game, seed, {
			item,
			rounds: 0,
			score: 0,
			token
		});
		return { id, game, recycling: { token, name: item[0] } };
	}
	if (game === 'color') {
		const token = randomUUID();
		const { id } = await GameRepository.createGameSession(user.id, game, seed, {
			cleared: 0,
			token
		});
		return { id, game, board: colorBoard(seed, 0, token) };
	}
	const { id } = await GameRepository.createGameSession(user.id, game, seed, {
		answers: [],
		signal: null
	});
	return { id, game };
}

function invalidRun() {
	return new AppError(APP_ERROR.INVALID_STATE, '유효하지 않거나 종료된 게임 · 다시 시작 필요');
}

async function getActiveGame(runId: string, user: User, game: GameId) {
	assertRule(canRecordGame(user));
	const session = await GameRepository.findGameSession(runId, user.id);
	if (
		!session?.roundState ||
		session.game !== game ||
		session.completedAt ||
		Date.now() - Date.parse(session.startedAt) > GAME_SESSION_MS
	) {
		throw invalidRun();
	}
	return { ...session, roundState: session.roundState };
}

async function getActiveReaction(runId: string, user: User) {
	const { roundState } = await getActiveGame(runId, user, 'reaction');
	if (!('signal' in roundState)) throw invalidRun();
	return roundState;
}

export async function openReactionSignal(runId: string, user: User) {
	const state = await getActiveReaction(runId, user);
	if (state.signal || state.answers.length >= REACTION_ROUNDS) {
		throw new AppError(APP_ERROR.CONFLICT, '이미 요청한 신호');
	}
	const signal = { token: randomUUID(), readyAt: Date.now() + randomInt(1500, 4000) };
	if (!(await GameRepository.updateGameRoundState(runId, user.id, { ...state, signal }, state))) {
		throw new AppError(APP_ERROR.CONFLICT, '진행 중인 게임이 변경됨 · 다시 시작 필요');
	}
	await wait(Math.max(0, signal.readyAt - Date.now()));
	return { token: signal.token };
}

export async function recordReactionClick(runId: string, token: string, user: User) {
	const receivedAt = Date.now();
	const state = await getActiveReaction(runId, user);
	if (!state.signal || state.signal.token !== token || receivedAt < state.signal.readyAt) {
		throw new AppError(APP_ERROR.INVALID_STATE, '유효하지 않은 수강신청 신호');
	}
	const elapsed = receivedAt - state.signal.readyAt;
	if (elapsed > REACTION_WINDOW_MS + NETWORK_GRACE_MS) {
		throw new AppError(APP_ERROR.BAD_REQUEST, '입력 시간 초과');
	}
	const measured = Math.min(elapsed, REACTION_WINDOW_MS);
	const next = { answers: [...state.answers, measured], signal: null };
	if (!(await GameRepository.updateGameRoundState(runId, user.id, next, state))) {
		throw new AppError(APP_ERROR.CONFLICT, '이미 처리된 입력');
	}
	return { elapsed: measured };
}

export async function recordColorChoice(runId: string, token: string, index: number, user: User) {
	const receivedAt = Date.now();
	const { seed, startedAt, roundState: state } = await getActiveGame(runId, user, 'color');
	if (!('cleared' in state) || state.token !== token) {
		throw new AppError(APP_ERROR.CONFLICT, '이미 처리되었거나 유효하지 않은 타일 선택');
	}

	const elapsed = receivedAt - Date.parse(startedAt);
	if (elapsed > COLOR_DURATION_MS + NETWORK_GRACE_MS) {
		return { cleared: state.cleared, outcome: 'timeout' as const };
	}

	const { side, target } = getColorBoard(seed, state.cleared);
	if (index < 0 || index >= side ** 2) {
		throw new AppError(APP_ERROR.BAD_REQUEST, '유효하지 않은 타일 선택');
	}
	const correct = index === target;
	const cleared = state.cleared + Number(correct);
	if (correct && elapsed < cleared * 100) {
		await GameRepository.updateGameRoundState(runId, user.id, null, state);
		throw new AppError(APP_ERROR.BAD_REQUEST, '입력 속도를 확인할 수 없어 이번 기록 미등록');
	}

	const outcome = !correct ? 'mistake' : cleared === COLOR_MAX_ROUNDS ? 'complete' : 'playing';
	const nextToken = outcome === 'playing' ? randomUUID() : null;
	if (
		!(await GameRepository.updateGameRoundState(
			runId,
			user.id,
			{ cleared, token: nextToken },
			state
		))
	) {
		throw new AppError(APP_ERROR.CONFLICT, '이미 처리된 입력');
	}
	return nextToken
		? { cleared, outcome, board: colorBoard(seed, cleared, nextToken) }
		: { cleared, outcome };
}

export async function cancelGame(runId: string, user: User) {
	assertRule(canRecordGame(user));
	await GameRepository.updateGameRoundState(runId, user.id, null);
}

export async function recordRecyclingChoice(
	runId: string,
	token: string,
	bin: RecyclingChoice,
	user: User
) {
	const receivedAt = Date.now();
	const { startedAt, roundState: state } = await getActiveGame(runId, user, 'recycling');
	if (!('item' in state) || state.token !== token) {
		throw new AppError(APP_ERROR.CONFLICT, '이미 처리되었거나 유효하지 않은 선택');
	}
	// Legacy sessions only stored an index into the previous question pool.
	if (!Array.isArray(state.item)) throw invalidRun();
	const [previousName] = state.item;
	const elapsed = receivedAt - Date.parse(startedAt);
	if (elapsed > RECYCLING_DURATION_MS + NETWORK_GRACE_MS) {
		return { score: state.score, outcome: 'timeout' as const };
	}

	const rounds = state.rounds + 1;
	if (elapsed < rounds * 100) {
		await GameRepository.updateGameRoundState(runId, user.id, null, state);
		throw new AppError(APP_ERROR.BAD_REQUEST, '입력 속도를 확인할 수 없어 이번 기록 미등록');
	}
	const { correctBin, scoreDelta } = gradeRecyclingChoice(state.item, bin);
	const score = state.score + scoreDelta;
	const previous = RECYCLING_ITEMS.findIndex(([name]) => name === previousName);
	const item = RECYCLING_ITEMS[pickRecyclingItem(previous)];
	const nextToken = rounds < RECYCLING_MAX_ROUNDS ? randomUUID() : null;
	if (
		!(await GameRepository.updateGameRoundState(
			runId,
			user.id,
			{ item, rounds, score, token: nextToken },
			state
		))
	) {
		throw new AppError(APP_ERROR.CONFLICT, '이미 처리된 입력');
	}
	return {
		score,
		correctBin,
		scoreDelta,
		outcome: nextToken ? ('playing' as const) : ('complete' as const),
		recycling: nextToken ? { token: nextToken, name: item[0] } : null
	};
}

export async function submitGame(runId: string, user: User) {
	assertRule(canRecordGame(user));
	return await transaction(async () => {
		const session = await GameRepository.findGameSession(runId, user.id);
		const state = session?.roundState;
		if (!state) throw invalidRun();
		if (session.completedScore !== null) return { score: session.completedScore, improved: false };
		const elapsed = Date.now() - Date.parse(session.startedAt);
		if (elapsed > GAME_SESSION_MS) throw invalidRun();

		let score: number | null = null;
		if (session.game === 'reaction' && 'answers' in state) {
			score = calculateReactionScore(state.answers);
			if (score !== null && isSuspiciousReaction(state.answers)) {
				throw new AppError(
					APP_ERROR.BAD_REQUEST,
					'반복해서 너무 빠른 입력이 감지되어 이번 기록 미등록'
				);
			}
		}
		if (session.game === 'color' && 'cleared' in state) {
			if (state.cleared > 0 && (!state.token || elapsed >= COLOR_DURATION_MS)) {
				score = state.cleared;
			}
		}
		if (session.game === 'recycling' && 'item' in state) {
			if (state.score > 0 && (!state.token || elapsed >= RECYCLING_DURATION_MS)) {
				score = state.score;
			}
		}
		if (score === null)
			throw new AppError(APP_ERROR.BAD_REQUEST, '아직 완료되지 않았거나 유효하지 않은 기록');
		if (!(await GameRepository.completeGameSession(runId, user.id, score, state))) {
			throw new AppError(APP_ERROR.CONFLICT, '게임 진행 상태가 변경됨 · 기록 다시 저장');
		}
		const improved = await GameRepository.upsertGameRecord(
			user.id,
			session.game,
			getGameWeek(),
			score
		);
		return { score, improved };
	});
}
