import BoardManager from '$lib/board/manager';
import UserManager from '$lib/user/manager.js';

export const load = async () => {
	const postsRaw = await BoardManager.getPostsByBoardId('main');
	const posts = await UserManager.fillDisplayNames(postsRaw, true);
	return { posts: JSON.stringify(posts) };
};
