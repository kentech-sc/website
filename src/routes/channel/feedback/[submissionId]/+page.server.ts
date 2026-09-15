import { fail, redirect } from '@sveltejs/kit';

import type { SubmissionId } from '$lib/types/submission.type.js';

import { withActionErrorHandling, withLoadErrorHandling } from '$lib/server/errors.js';
import * as FeedbackUsecase from '$lib/usecase/feedback.usecase.js';

function readSubmissionId(formData: FormData): SubmissionId {
	return (formData.get('submission-id') ?? '').toString();
}

export const load = withLoadErrorHandling(async ({ params, request, locals }) => {
	const submissionId = params.submissionId;
	if (!submissionId) throw new Error('문의·건의 ID가 필요합니다.');
	const shouldIncrementView =
		new URL(request.url).searchParams.get('x-sveltekit-invalidated') !== '11';
	return await FeedbackUsecase.getFeedbackDetail(submissionId, locals.user, {
		incrementView: shouldIncrementView
	});
});

export const actions = {
	deleteSubmission: withActionErrorHandling(async ({ request, locals }) => {
		const submissionId = readSubmissionId(await request.formData());
		if (!submissionId) return fail(400, { message: '문의·건의 ID가 필요합니다.' });
		await FeedbackUsecase.deleteFeedback(submissionId, locals.user);
		throw redirect(302, '/channel/feedback');
	}),
	supportSubmission: withActionErrorHandling(async ({ request, locals }) => {
		const submissionId = readSubmissionId(await request.formData());
		return { submission: await FeedbackUsecase.supportFeedback(submissionId, locals.user) };
	}),
	cancelSupport: withActionErrorHandling(async ({ request, locals }) => {
		const submissionId = readSubmissionId(await request.formData());
		return { submission: await FeedbackUsecase.cancelFeedbackSupport(submissionId, locals.user) };
	}),
	reviewSubmission: withActionErrorHandling(async ({ request, locals }) => {
		const submissionId = readSubmissionId(await request.formData());
		return { submission: await FeedbackUsecase.reviewFeedback(submissionId, locals.user) };
	}),
	cancelReview: withActionErrorHandling(async ({ request, locals }) => {
		const submissionId = readSubmissionId(await request.formData());
		return { submission: await FeedbackUsecase.cancelFeedbackReview(submissionId, locals.user) };
	}),
	respondToSubmission: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const submissionId = readSubmissionId(formData);
		const response = (formData.get('response') ?? '').toString();
		if (!response || !submissionId) return fail(400, { message: '답변 내용은 필수입니다.' });
		return {
			submission: await FeedbackUsecase.respondToFeedback(submissionId, locals.user, response)
		};
	}),
	editResponse: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const submissionId = readSubmissionId(formData);
		const response = (formData.get('response') ?? '').toString();
		if (!response || !submissionId) return fail(400, { message: '답변 내용은 필수입니다.' });
		return {
			submission: await FeedbackUsecase.reviseFeedbackResponse(submissionId, locals.user, response)
		};
	}),
	deleteResponse: withActionErrorHandling(async ({ request, locals }) => {
		const submissionId = readSubmissionId(await request.formData());
		return { submission: await FeedbackUsecase.deleteFeedbackResponse(submissionId, locals.user) };
	})
};
