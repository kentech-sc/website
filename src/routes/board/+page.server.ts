import BoardManager from '$lib/board/manager';
import { error } from '@sveltejs/kit';

export const load = async () => {
	const post_res = await BoardManager.getPostsByBoardId('main');
	if (!post_res.ok) error(400, { message: post_res.error });
	const postArr = post_res.value;
	return { postArr: JSON.stringify(postArr) };
};
