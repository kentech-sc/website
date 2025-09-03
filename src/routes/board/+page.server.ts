import BoardService from '$lib/board/service';
import UserService from '$lib/user/service.js';

export const load = async () => {
	const postsRaw = await BoardService.getPostsByBoardId('main');
	const posts = await UserService.fillDisplayNames(postsRaw, true);
	return { posts: JSON.stringify(posts) };
};
