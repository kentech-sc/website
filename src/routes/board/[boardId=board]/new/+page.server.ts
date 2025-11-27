import * as PostService from '$lib/srv/post.srv.js';

import { fail, redirect } from '@sveltejs/kit';

import { DisplayType } from '$lib/types/user.type.js';

import { withActionErrorHandling } from '$lib/common/errors.js';

import { SrvError } from '$lib/common/errors.js';
import { BoardId } from '$lib/types/board.type.js';

// The below line is essential to prevent rendering the page without server request which leads to skipping the server hooks.
export const load = () => {};

export const actions = {
	createPost: withActionErrorHandling(async ({ request, locals, params }) => {
		const boardId = params.boardId;
		if (!(Object.values(BoardId).includes(boardId as BoardId))) throw new SrvError('boardId missing');

		const formData = await request.formData();
		const title = (formData.get('title') ?? '').toString();
		const content = (formData.get('content') ?? '').toString();
		const displayTypeRaw = (formData.get('displayType') ?? '').toString();

		if (!Object.values(DisplayType).includes(displayTypeRaw as DisplayType))
			return fail(400, { message: 'displayType is invalid' });

		const displayType = displayTypeRaw as DisplayType;

		if (!title || !content) return fail(400, { message: 'title, content are required' });

		const post = await PostService.createPostByBoardId(
			boardId as BoardId,
			title,
			content,
			locals.user,
			displayType
		);

		redirect(302, '/board/' + params.boardId + '/' + post._id);
	})
};
