import { fail, redirect } from '@sveltejs/kit';

import editorActions, { normalizeEditorContent } from '$lib/server/editor.js';
import type { PostId } from '$lib/types/post.type.js';
import { DisplayType } from '$lib/types/user.type.js';
import { withActionErrorHandling, withLoadErrorHandling } from '$lib/server/errors.js';
import * as BoardUsecase from '$lib/usecase/board.usecase.js';

export const load = withLoadErrorHandling(async ({ params, locals }) => {
	const postIdRaw = params.postId;
	if (!postIdRaw) throw new Error('게시글 ID가 필요합니다.');
	const postId: PostId = postIdRaw;

	const detail = await BoardUsecase.getPostDetailByPostId(postId, locals.user);

	return { post: detail.post, files: detail.files, permissions: detail.postPermissions };
});

export const actions = {
	editPost: withActionErrorHandling(async ({ request, locals, params }) => {
		const postIdRaw = params.postId;
		if (!postIdRaw) return fail(400, { message: '게시글 ID가 필요합니다.' });
		const postId: PostId = postIdRaw;

		const formData = await request.formData();
		const title = (formData.get('title') ?? '').toString();
		const content = (formData.get('content') ?? '').toString();
		const displayTypeRaw = (formData.get('displayType') ?? '').toString();
		const fileIds = formData.getAll('fileIds').map((fileId) => fileId.toString());

		if (!Object.values(DisplayType).includes(displayTypeRaw as DisplayType)) {
			return fail(400, { message: '표시 방식이 올바르지 않습니다.' });
		}
		if (!title || !content) return fail(400, { message: '제목과 내용은 필수입니다.' });

		const normalizedEditor = await normalizeEditorContent(content, fileIds);
		const post = await BoardUsecase.editPost(
			postId,
			title,
			normalizedEditor.content,
			locals.user,
			displayTypeRaw as DisplayType,
			normalizedEditor.fileIds
		);
		throw redirect(302, '/board/' + params.boardId + '/' + post._id);
	}),
	...editorActions
};
