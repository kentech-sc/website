import { AppError, withLoadErrorHandling } from '$lib/server/errors.js';
import { isBoardId } from '$lib/shared/board.js';
import { APP_ERROR } from '$lib/shared/rule.js';
import * as BoardUsecase from '$lib/usecase/board.usecase.js';

export const load = withLoadErrorHandling(async ({ url, params, locals }) => {
	const boardIdRaw = params.boardId;
	if (!isBoardId(boardIdRaw)) {
		throw new AppError(APP_ERROR.BAD_REQUEST, '유효하지 않은 게시판입니다.');
	}

	const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);
	const postResult = await BoardUsecase.getBoardPage(boardIdRaw, page, locals.user);

	return postResult;
});
