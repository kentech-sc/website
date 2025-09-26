import BoardService from '$lib/board/service';
import UserService from '$lib/user/service.js';
import { Types } from 'mongoose';

export const load = async ({ url }) => {
	const fromIdRaw = url.searchParams.get('from');
	const fromId = fromIdRaw ? new Types.ObjectId(fromIdRaw) : undefined;

	const toIdRaw = url.searchParams.get('to');
	const toId = toIdRaw ? new Types.ObjectId(toIdRaw) : undefined;

	const limit = 5;

	const postResult = await BoardService.getPostsByBoardId('main', limit, { fromId, toId });
	const postsRaw = postResult.pageItems;
	const posts = await UserService.fillDisplayNames(postsRaw, true);

	return {
		posts: JSON.stringify(posts),
		fromId: postResult.fromId?.toString(),
		toId: postResult.toId?.toString()
	};
};
