import * as PostService from '$lib/srv/post.srv.js';
import * as UserService from '$lib/srv/user.srv.js';

import { BoardId } from '$lib/types/board.type.js';
import { Types } from 'mongoose';

import { withLoadErrorHandling } from '$lib/common/errors.js';

import { SrvError } from '$lib/common/errors.js';

export const load = withLoadErrorHandling(async ({ url, params }) => {
	const boardId = params.boardId;
	if (!(Object.values(BoardId).includes(boardId as BoardId))) throw new SrvError('boardId missing');

	const fromIdRaw = url.searchParams.get('from');
	const fromId = fromIdRaw ? new Types.ObjectId(fromIdRaw) : undefined;

	const toIdRaw = url.searchParams.get('to');
	const toId = toIdRaw ? new Types.ObjectId(toIdRaw) : undefined;

	const limit = 10;

	const postResult = await PostService.getPostsByBoardId(boardId as BoardId, limit, {
		fromId,
		toId
	});
	const postsRaw = postResult.pageItems;
	const posts = await UserService.fillDisplayNames(postsRaw, true);

	return {
		posts: JSON.stringify(posts),
		fromId: postResult.fromId?.toString(),
		toId: postResult.toId?.toString()
	};
});
