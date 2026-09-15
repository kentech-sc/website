import { withLoadErrorHandling } from '$lib/server/errors.js';
import { BoardId } from '$lib/types/board.type.js';
import * as BoardUsecase from '$lib/usecase/board.usecase.js';

export const load = withLoadErrorHandling(async ({ url, locals }) => {
	const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);
	return await BoardUsecase.getBoardPage(BoardId.Bylaw, page, locals.user);
});
