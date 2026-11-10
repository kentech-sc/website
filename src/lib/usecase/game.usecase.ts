import type { GameDashboard, GameId } from '$lib/types/game.type.js';
import type { User } from '$lib/types/user.type.js';

import * as GameRepository from '$lib/repositories/game.repository.js';
import * as GameService from '$lib/services/game.service.js';
import { getGameWeek } from '$lib/shared/games.js';

export async function getDashboard(user: User, week = getGameWeek()): Promise<GameDashboard> {
	const [reactionWeek, reactionAll, colorWeek, colorAll, recyclingWeek, recyclingAll] =
		await Promise.all([
			GameRepository.findGameLeaderboard('reaction', week, user.id),
			GameRepository.findGameLeaderboard('reaction', null, user.id),
			GameRepository.findGameLeaderboard('color', week, user.id),
			GameRepository.findGameLeaderboard('color', null, user.id),
			GameRepository.findGameLeaderboard('recycling', week, user.id),
			GameRepository.findGameLeaderboard('recycling', null, user.id)
		]);
	return {
		reaction: { week: reactionWeek, all: reactionAll },
		color: { week: colorWeek, all: colorAll },
		recycling: { week: recyclingWeek, all: recyclingAll }
	};
}

export async function startGame(game: GameId, user: User) {
	return await GameService.startGame(game, user);
}

export {
	cancelGame,
	openReactionSignal,
	recordColorChoice,
	recordReactionClick,
	recordRecyclingChoice,
	submitGame
} from '$lib/services/game.service.js';
