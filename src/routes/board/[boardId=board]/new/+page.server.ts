import BoardService from '$lib/board/service';
import { fail, redirect } from '@sveltejs/kit';

// export const load = async () => {
// 	const postArr = await BoardService.getPostsByBoardId('main');
// 	return { postArr: JSON.stringify(postArr) };
// };

export const actions = {
	createPost: async ({ request, locals, params }) => {
		const formData = await request.formData();
		const title = (formData.get('title') ?? '').toString();
		const content = (formData.get('content') ?? '').toString();
		const displayType = (formData.get('displayType') ?? '').toString();

		if (displayType !== 'anonymous' && displayType !== 'nickname' && displayType !== 'realName')
			return fail(400, { message: 'displayType is invalid' });

		if (!title || !content) return fail(400, { message: 'title, content are required' });

		const post = await BoardService.createPostByBoardId(
			params.boardId,
			title,
			content,
			locals.user,
			displayType
		);

		redirect(302, '/board/' + params.boardId + '/' + post._id);
	}
};
