import { fail, redirect } from '@sveltejs/kit';

import editorActions, { normalizeEditorContent } from '$lib/server/editor.js';
import { withActionErrorHandling } from '$lib/server/errors.js';
import * as PetitionUsecase from '$lib/usecase/petition.usecase.js';

export const load = () => {};

export const actions = {
	createPetition: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const title = (formData.get('title') ?? '').toString();
		const content = (formData.get('content') ?? '').toString();

		if (!title || !content) return fail(400, { message: '제목과 내용은 필수입니다.' });

		const fileIds = formData.getAll('fileIds').map((fileId) => fileId.toString());
		const normalizedEditor = await normalizeEditorContent(content, fileIds);
		const petition = await PetitionUsecase.createPetition(
			title,
			normalizedEditor.content,
			locals.user,
			normalizedEditor.fileIds
		);

		throw redirect(302, '/petition/' + petition._id);
	}),
	...editorActions
};
