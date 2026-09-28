import { fail, redirect } from '@sveltejs/kit';

import editorActions, { normalizeEditorContent } from '$lib/server/editor.js';
import { withActionErrorHandling, withLoadErrorHandling } from '$lib/server/errors.js';
import { isSubmissionCategory } from '$lib/shared/submission.js';
import { AuthorNameMode } from '$lib/types/user.type.js';
import * as FeedbackUsecase from '$lib/usecase/feedback.usecase.js';

const DISPLAY_TYPES: AuthorNameMode[] = [
	AuthorNameMode.RealName,
	AuthorNameMode.Nickname,
	AuthorNameMode.Anonymous
];

export const load = withLoadErrorHandling(async ({ params, locals }) => {
	if (!params.submissionId) throw new Error('문의·건의 ID가 필요합니다.');
	const detail = await FeedbackUsecase.getFeedbackDetail(params.submissionId, locals.user, {
		incrementView: false
	});
	if (!detail.permissions.canEdit) throw redirect(302, `/channel/feedback/${params.submissionId}`);
	return detail;
});

export const actions = {
	editFeedback: withActionErrorHandling(async ({ request, locals, params }) => {
		if (!params.submissionId) return fail(400, { message: '문의·건의 ID가 필요합니다.' });
		const formData = await request.formData();
		const category = (formData.get('category') ?? '').toString();
		const authorNameMode = (formData.get('authorNameMode') ?? '').toString() as AuthorNameMode;
		const title = (formData.get('title') ?? '').toString();
		const content = (formData.get('content') ?? '').toString();
		if (!isSubmissionCategory(category)) {
			return fail(400, { message: '담당 분야가 올바르지 않습니다.' });
		}
		if (!DISPLAY_TYPES.includes(authorNameMode)) {
			return fail(400, { message: '표시 방식이 올바르지 않습니다.' });
		}
		if (!title || !content) return fail(400, { message: '제목과 내용은 필수입니다.' });
		const fileIds = formData.getAll('fileIds').map(String);
		const normalized = await normalizeEditorContent(content, fileIds);
		const submission = await FeedbackUsecase.editFeedback(
			params.submissionId,
			category,
			authorNameMode,
			title,
			normalized.content,
			locals.user,
			normalized.fileIds
		);
		throw redirect(302, `/channel/feedback/${submission.id}`);
	}),
	...editorActions
};
