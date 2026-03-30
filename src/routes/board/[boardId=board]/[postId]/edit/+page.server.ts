import * as BoardApplication from '$lib/app/board.app.js';

import { fail, redirect } from '@sveltejs/kit';
import { Types } from 'mongoose';

import type { PostId } from '$lib/types/post.type.js';

import { withActionErrorHandling, withLoadErrorHandling } from '$lib/common/errors.js';

import quillActions from '$components/quill-actions.js';

export const load = withLoadErrorHandling(async ({ params }) => {
	const postIdRaw = params.postId;
	const postId: PostId = new Types.ObjectId(postIdRaw);

	const { post, files } = await BoardApplication.getPostDetailByPostId(postId);

	return { post: JSON.stringify(post), files: JSON.stringify(files) };
});

export const actions = {
	editPost: withActionErrorHandling(async ({ request, locals, params }) => {
		const postIdRaw = params.postId;
		const postId: PostId = new Types.ObjectId(postIdRaw);

		const formData = await request.formData();

		const title = (formData.get('title') ?? '').toString();
		const content = (formData.get('content') ?? '').toString();
		const displayType = (formData.get('displayType') ?? '').toString();

		const fileMetas = formData
			.getAll('fileMetas')
			.map((fileMeta) => JSON.parse((fileMeta ?? '').toString()));
		const fileIds = fileMetas.map((fileMeta) => fileMeta._id);

		if (displayType !== 'anonymous' && displayType !== 'nickname' && displayType !== 'realName')
			return fail(400, { message: 'displayType is invalid' });

		if (!title || !content) return fail(400, { message: 'title, content are required' });

		const post = await BoardApplication.editPost(
			postId,
			title,
			content,
			locals.user,
			displayType,
			fileIds
		);
		redirect(302, '/board/' + params.boardId + '/' + post._id);
	}),
	...quillActions
};
