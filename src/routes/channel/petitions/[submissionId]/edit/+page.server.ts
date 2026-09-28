import { fail, redirect } from '@sveltejs/kit';

import editorActions, { normalizeEditorContent } from '$lib/server/editor.js';
import { withActionErrorHandling, withLoadErrorHandling } from '$lib/server/errors.js';
import * as PetitionUsecase from '$lib/usecase/petition.usecase.js';

export const load = withLoadErrorHandling(async ({ params, locals }) => {
	if (!params.submissionId) throw new Error('청원 ID가 필요합니다.');
	const detail = await PetitionUsecase.getPetitionDetail(params.submissionId, locals.user, {
		incrementView: false
	});
	if (!detail.permissions.canEdit) throw redirect(302, `/channel/petitions/${params.submissionId}`);
	return detail;
});

export const actions = {
	editPetition: withActionErrorHandling(async ({ request, locals, params }) => {
		if (!params.submissionId) return fail(400, { message: '청원 ID가 필요합니다.' });
		const formData = await request.formData();
		const title = (formData.get('title') ?? '').toString();
		const content = (formData.get('content') ?? '').toString();
		if (!title || !content) return fail(400, { message: '제목과 내용은 필수입니다.' });
		const fileIds = formData.getAll('fileIds').map(String);
		const normalized = await normalizeEditorContent(content, fileIds);
		const petition = await PetitionUsecase.editPetition(
			params.submissionId,
			title,
			normalized.content,
			locals.user,
			normalized.fileIds
		);
		throw redirect(302, `/channel/petitions/${petition.id}`);
	}),
	...editorActions
};
