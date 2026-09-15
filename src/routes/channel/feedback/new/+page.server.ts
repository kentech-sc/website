import { fail, redirect } from '@sveltejs/kit';

import editorActions, { normalizeEditorContent } from '$lib/server/editor.js';
import { withActionErrorHandling } from '$lib/server/errors.js';
import { isFeedbackKind, isSubmissionCategory } from '$lib/shared/submission.js';
import { DisplayType } from '$lib/types/user.type.js';
import * as FeedbackUsecase from '$lib/usecase/feedback.usecase.js';

const FEEDBACK_DISPLAY_TYPES: DisplayType[] = [
	DisplayType.RealName,
	DisplayType.Nickname,
	DisplayType.Anonymous
];

export const load = () => {};

export const actions = {
	createFeedback: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const kind = (formData.get('kind') ?? '').toString();
		const category = (formData.get('category') ?? '').toString();
		const displayType = (formData.get('displayType') ?? '').toString();
		const title = (formData.get('title') ?? '').toString();
		const content = (formData.get('content') ?? '').toString();

		if (!isFeedbackKind(kind) || !isSubmissionCategory(category)) {
			return fail(400, { message: '유형 또는 담당 분야가 올바르지 않습니다.' });
		}
		if (!FEEDBACK_DISPLAY_TYPES.includes(displayType as DisplayType)) {
			return fail(400, { message: '표시 방식이 올바르지 않습니다.' });
		}
		if (!title || !content) return fail(400, { message: '제목과 내용은 필수입니다.' });

		const fileIds = formData.getAll('fileIds').map((fileId) => fileId.toString());
		const normalizedEditor = await normalizeEditorContent(content, fileIds);
		const submission = await FeedbackUsecase.createFeedback(
			kind,
			category,
			displayType as DisplayType,
			title,
			normalizedEditor.content,
			locals.user,
			normalizedEditor.fileIds
		);
		throw redirect(302, '/channel/feedback/' + submission.id);
	}),
	...editorActions
};
