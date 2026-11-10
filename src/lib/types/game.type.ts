import type { RecyclingItem } from '$lib/shared/recycling.js';
import type { UserHouse } from './user.type.js';

export type GameId = 'reaction' | 'color' | 'recycling';
export type GamePeriod = 'week' | 'all';

export interface GameSession {
	id: string;
	game: GameId;
	seed?: number;
	board?: RankedColorBoard;
	recycling?: RecyclingPrompt;
}

export interface RecyclingPrompt {
	token: string;
	name: string;
}

export interface RankedColorBoard {
	token: string;
	side: number;
	colors: string[];
}

export interface ReactionRunState {
	answers: number[];
	signal: { token: string; readyAt: number } | null;
}

export interface ColorRunState {
	cleared: number;
	token: string | null;
}

export interface RecyclingRunState {
	item: RecyclingItem;
	rounds: number;
	score: number;
	token: string | null;
}

export type GameRunState = ReactionRunState | ColorRunState | RecyclingRunState;

export interface GameStanding {
	userId: string;
	nickname: string;
	house: UserHouse | null;
	score: number;
	rank: number;
	participants: number;
}

export interface GameLeaderboard {
	entries: GameStanding[];
	personal: GameStanding | null;
	participants: number;
}

export type GameDashboard = Record<GameId, Record<GamePeriod, GameLeaderboard>>;
