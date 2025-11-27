import * as PostService from '$lib/srv/post.srv.js';

import { fail, redirect } from '@sveltejs/kit';
import { Types } from 'mongoose';

import type { PostId } from '$lib/types/post.type.js';

import { withActionErrorHandling, withLoadErrorHandling } from '$lib/common/errors.js';

export const load = withLoadErrorHandling(async ({ params }) => {
	const postIdRaw = params.postId;
	const postId: PostId = new Types.ObjectId(postIdRaw);

	const post = await PostService.getPostById(postId);

	return { post: JSON.stringify(post) };
});

export const actions = {
	editPost: withActionErrorHandling(async ({ request, locals, params }) => {
		const postIdRaw = params.postId;
		const postId: PostId = new Types.ObjectId(postIdRaw);

		const formData = await request.formData();

		const title = (formData.get('title') ?? '').toString();
		const content = (formData.get('content') ?? '').toString();
		const displayType = (formData.get('displayType') ?? '').toString();

		if (displayType !== 'anonymous' && displayType !== 'nickname' && displayType !== 'realName')
			return fail(400, { message: 'displayType is invalid' });

		if (!title || !content) return fail(400, { message: 'title, content are required' });

		const post = await PostService.editPostById(
			postId,
			{
				title,
				content,
				displayType
			},
			locals.user
		);
		redirect(302, '/board/' + params.boardId + '/' + post._id);
	})
};
