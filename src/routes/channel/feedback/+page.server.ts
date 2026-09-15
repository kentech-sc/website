import * as FeedbackUsecase from '$lib/usecase/feedback.usecase.js';

export const load = async ({ url, locals }) => {
	const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);
	return await FeedbackUsecase.getFeedbackPage(page, locals.user);
};
