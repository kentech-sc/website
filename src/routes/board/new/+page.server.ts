import BoardManager from '$lib/board/manager';
import { fail, redirect } from '@sveltejs/kit';

// export const load = async () => {
// 	const postArr = await BoardManager.getPostsByBoardId('main');
// 	return { postArr: JSON.stringify(postArr) };
// };

export const actions = {
	createPost: async ({ request, locals }) => {
		const formData = await request.formData();
		const title = (formData.get('title') ?? '').toString();
		const content = (formData.get('content') ?? '').toString();

		if (!title || !content) return fail(400, { message: 'title, content are required' });

		const post = await BoardManager.createPostByBoardId('main', title, content, locals.user._id);
		// post.userName = locals.user.name;
		redirect(302, '/board/' + post._id);
	}
};
