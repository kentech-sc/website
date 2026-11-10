import { pickReactionCourses } from './_components/reaction-cart.js';

import { canRecordGame } from '$lib/rules/game.rule.js';
import { withLoadErrorHandling } from '$lib/server/errors.js';
import { getGameWeek } from '$lib/shared/games.js';
import * as GameUsecase from '$lib/usecase/game.usecase.js';

export const load = withLoadErrorHandling(async ({ locals }) => {
	const week = getGameWeek();
	return {
		leaderboards: await GameUsecase.getDashboard(locals.user, week),
		reactionCourses: pickReactionCourses(),
		week,
		canRank: canRecordGame(locals.user).ok
	};
});
