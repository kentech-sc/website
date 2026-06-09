import { fail, redirect } from '@sveltejs/kit';

import editorActions, { normalizeEditorContent } from '$lib/server/editor.js';
import { BoardId, type BoardId as BoardIdType } from '$lib/types/board.type.js';
import { APP_ERROR } from '$lib/shared/rule.js';
import { DisplayType } from '$lib/types/user.type.js';
import { AppError, withActionErrorHandling } from '$lib/server/errors.js';
import * as BoardUsecase from '$lib/usecase/board.usecase.js';

export const load = () => {};

export const actions = {
	createPost: withActionErrorHandling(async ({ request, locals, params }) => {
		const boardIdRaw = params.boardId;
		if (!Object.values(BoardId).includes(boardIdRaw as BoardIdType)) {
			throw new AppError(APP_ERROR.BAD_REQUEST, '유효하지 않은 게시판입니다.');
		}

		const formData = await request.formData();
		const title = (formData.get('title') ?? '').toString();
		const content = (formData.get('content') ?? '').toString();
		const displayTypeRaw = (formData.get('displayType') ?? '').toString();

		if (!Object.values(DisplayType).includes(displayTypeRaw as DisplayType)) {
			return fail(400, { message: '표시 방식이 올바르지 않습니다.' });
		}

		if (!title || !content) {
			return fail(400, { message: '제목과 내용은 필수입니다.' });
		}

		const fileIds = formData.getAll('fileIds').map((fileId) => fileId.toString());
		const normalizedEditor = await normalizeEditorContent(content, fileIds);
		const post = await BoardUsecase.createPost(
			boardIdRaw as BoardIdType,
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
