import { fail, redirect } from '@sveltejs/kit';

import type { SubmissionId } from '$lib/types/submission.type.js';

import { withActionErrorHandling, withLoadErrorHandling } from '$lib/server/errors.js';
import * as PetitionUsecase from '$lib/usecase/petition.usecase.js';

function readSubmissionId(formData: FormData): SubmissionId {
	return (formData.get('submission-id') ?? '').toString();
}

export const load = withLoadErrorHandling(async ({ params, request, locals }) => {
	const submissionId = params.submissionId;
	if (!submissionId) throw new Error('청원 ID가 필요합니다.');

	const shouldIncrementView =
		new URL(request.url).searchParams.get('x-sveltekit-invalidated') !== '11';
	return await PetitionUsecase.getPetitionDetail(submissionId, locals.user, {
		incrementView: shouldIncrementView
	});
});

export const actions = {
	deleteSubmission: withActionErrorHandling(async ({ request, locals }) => {
		const submissionId = readSubmissionId(await request.formData());
		if (!submissionId) return fail(400, { message: '청원 ID가 필요합니다.' });
		await PetitionUsecase.deletePetitionById(submissionId, locals.user);
		throw redirect(302, '/channel/petition');
	}),
	supportSubmission: withActionErrorHandling(async ({ request, locals }) => {
		const submissionId = readSubmissionId(await request.formData());
		return { petition: await PetitionUsecase.signPetition(submissionId, locals.user) };
	}),
	cancelSupport: withActionErrorHandling(async ({ request, locals }) => {
		const submissionId = readSubmissionId(await request.formData());
		return { petition: await PetitionUsecase.unsignPetition(submissionId, locals.user) };
	}),
	reviewSubmission: withActionErrorHandling(async ({ request, locals }) => {
		const submissionId = readSubmissionId(await request.formData());
		return { petition: await PetitionUsecase.reviewPetition(submissionId, locals.user) };
	}),
	cancelReview: withActionErrorHandling(async ({ request, locals }) => {
		const submissionId = readSubmissionId(await request.formData());
		return { petition: await PetitionUsecase.unreviewPetition(submissionId, locals.user) };
	}),
	respondToSubmission: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const submissionId = readSubmissionId(formData);
		const response = (formData.get('response') ?? '').toString();
		if (!response || !submissionId) return fail(400, { message: '답변 내용은 필수입니다.' });
		return {
			petition: await PetitionUsecase.respondToPetition(submissionId, locals.user, response)
		};
	}),
	editResponse: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const submissionId = readSubmissionId(formData);
		const response = (formData.get('response') ?? '').toString();
		if (!response || !submissionId) return fail(400, { message: '답변 내용은 필수입니다.' });
		return {
			petition: await PetitionUsecase.editPetitionResponse(submissionId, locals.user, response)
		};
	}),
	deleteResponse: withActionErrorHandling(async ({ request, locals }) => {
		const submissionId = readSubmissionId(await request.formData());
		return {
			petition: await PetitionUsecase.deletePetitionResponse(submissionId, locals.user)
		};
	})
};
