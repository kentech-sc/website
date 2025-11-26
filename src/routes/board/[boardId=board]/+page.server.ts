import * as PostService from '$lib/srv/post.srv.js';
import * as UserService from '$lib/srv/user.srv.js';

import { Types } from 'mongoose';

export const load = async ({ url, params }) => {
	const boardId = params.boardId;

	const fromIdRaw = url.searchParams.get('from');
	const fromId = fromIdRaw ? new Types.ObjectId(fromIdRaw) : undefined;

	const toIdRaw = url.searchParams.get('to');
	const toId = toIdRaw ? new Types.ObjectId(toIdRaw) : undefined;

	const limit = 10;

	const postResult = await PostService.getPostsByBoardId(boardId, limit, { fromId, toId });
	const postsRaw = postResult.pageItems;
	const posts = await UserService.fillDisplayNames(postsRaw, true);

	return {
		posts: JSON.stringify(posts),
		fromId: postResult.fromId?.toString(),
		toId: postResult.toId?.toString()
	};
};
