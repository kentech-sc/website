import { BoardId, type BoardId as BoardIdType } from '$lib/types/board.type.js';

import { APP_ERROR } from '$lib/shared/rule.js';
import { AppError, withLoadErrorHandling } from '$lib/server/errors.js';
import * as BoardUsecase from '$lib/usecase/board.usecase.js';

export const load = withLoadErrorHandling(async ({ url, params, locals }) => {
	const boardIdRaw = params.boardId;
	if (!Object.values(BoardId).includes(boardIdRaw as BoardIdType)) {
		throw new AppError(APP_ERROR.BAD_REQUEST, '유효하지 않은 게시판입니다.');
	}

	const boardId = boardIdRaw as BoardIdType;
	const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);
	const result = await BoardUsecase.getBoardPage(boardId, page, locals.user);

	return {
		posts: result.posts,
		filePresence: result.filePresence,
		prevHref: result.hasPrev ? `/board/${boardId}?page=${page - 1}` : undefined,
		nextHref: result.hasNext ? `/board/${boardId}?page=${page + 1}` : undefined,
		canCreatePost: result.canCreatePost
	};
});
