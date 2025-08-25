import BoardManager from '$lib/board/manager';

export const load = async () => {
	const postArr = await BoardManager.getPostsByBoardId('main');
	return { postArr: JSON.stringify(postArr) };
};
