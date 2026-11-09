import type { GameId } from '../types/game.type.js';

export const REACTION_ROUNDS = 5;
export const REACTION_WINDOW_MS = 2000;
export const COLOR_DURATION_MS = 30_000;
export const COLOR_MAX_ROUNDS = 200;
export const GAME_SESSION_MS = 5 * 60_000;

export const GAME_INFO = {
	reaction: {
		title: '순발력',
		description: '수강신청 연습',
		instruction: '수강신청 버튼이 활성화되면 빠르게 클릭하세요.',
		rule: '5회 평균 · 낮은 기록순',
		unit: 'ms'
	},
	color: {
		title: '절대색감',
		description: '색이 다른 타일 찾기',
		instruction: '색깔이 다른 타일 하나를 찾아 클릭하세요.',
		rule: '제한 시간 30초 · 높은 기록순',
		unit: '단계'
	},
	recycling: {
		title: '분리배출',
		description: '품목 종류 맞히기',
		instruction: '제시된 품목을 알맞게 분리배출하세요.',
		rule: '제한 시간 30초 · 높은 기록순',
		unit: '점'
	}
} as const;

export function isGameId(value: unknown): value is GameId {
	return typeof value === 'string' && Object.hasOwn(GAME_INFO, value);
}

/** 한국 시간 월요일 00:00을 주간 집계 경계로 사용한다. */
export function getGameWeek(now = new Date()): string {
	const kst = new Date(now.getTime() + 9 * 60 * 60_000);
	const mondayOffset = (kst.getUTCDay() + 6) % 7;
	kst.setUTCDate(kst.getUTCDate() - mondayOffset);
	return kst.toISOString().slice(0, 10);
}

export function getNextGameWeekStart(now = new Date()): string {
	const weekStart = Date.parse(`${getGameWeek(now)}T00:00:00+09:00`);
	return new Date(weekStart + 7 * 24 * 60 * 60_000).toISOString();
}

export function formatGameScore(game: GameId, score: number): string {
	const unit = GAME_INFO[game].unit;
	return game === 'reaction' ? `${score.toLocaleString('ko-KR')} ${unit}` : `${score}${unit}`;
}

export function getReactionDelay(seed: number, round: number): number {
	return 1500 + Math.floor(randomAt(seed, round, 7) * 2500);
}

function randomAt(seed: number, round: number, salt: number): number {
	let value = (seed ^ Math.imul(round + 1, 0x9e3779b1) ^ Math.imul(salt, 0x85ebca6b)) >>> 0;
	value = Math.imul(value ^ (value >>> 16), 0x21f0aaad);
	value = Math.imul(value ^ (value >>> 15), 0x735a2d97);
	return ((value ^ (value >>> 15)) >>> 0) / 4294967296;
}

export function getColorBoard(seed: number, round: number) {
	const side = Math.min(6, 2 + Math.floor(round / 3));
	const hue = Math.floor(randomAt(seed, round, 1) * 360);
	const saturation = 45 + Math.floor(randomAt(seed, round, 2) * 25);
	const lightness = 35 + Math.floor(randomAt(seed, round, 3) * 20);
	const difference = Math.max(3, 18 - round * 0.8);
	return {
		side,
		target: Math.floor(randomAt(seed, round, 4) * side * side),
		base: `hsl(${hue} ${saturation}% ${lightness}%)`,
		accent: `hsl(${hue} ${saturation}% ${lightness + difference}%)`
	};
}

export function isGameRunId(value: unknown): value is string {
	return (
		typeof value === 'string' &&
		/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(value)
	);
}

export function calculateReactionScore(times: number[]): number | null {
	if (
		times.length !== REACTION_ROUNDS ||
		times.some((time) => !Number.isInteger(time) || time < 0 || time > REACTION_WINDOW_MS)
	)
		return null;
	return Math.round(times.reduce((total, time) => total + time, 0) / REACTION_ROUNDS);
}

export function isSuspiciousReaction(times: number[]): boolean {
	return times.filter((time) => time < 50).length >= REACTION_ROUNDS - 1;
}
