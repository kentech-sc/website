import BoardService from '$lib/board/service';
import { fail, redirect } from '@sveltejs/kit';
import type { PostId } from '$lib/board/types';
import { Types } from 'mongoose';

export const load = async ({ params }) => {
	const postIdRaw = params.postId;
	const postId: PostId = new Types.ObjectId(postIdRaw);

	const post = await BoardService.getPostById(postId);

	return { post: JSON.stringify(post) };
};

export const actions = {
	editPost: async ({ request, locals, params }) => {
		const postIdRaw = params.postId;
		const postId: PostId = new Types.ObjectId(postIdRaw);

		const formData = await request.formData();

		const title = (formData.get('title') ?? '').toString();
		const content = (formData.get('content') ?? '').toString();
		const displayType = (formData.get('displayType') ?? '').toString();

		if (displayType !== 'anonymous' && displayType !== 'nickname' && displayType !== 'realName')
			return fail(400, { message: 'displayType is invalid' });

		if (!title || !content) return fail(400, { message: 'title, content are required' });

		const post = await BoardService.editPostById(
			postId,
			{
				title,
				content,
				displayType
			},
			locals.user
		);
		redirect(302, '/board/' + params.boardId + '/' + post._id);
	}
};
