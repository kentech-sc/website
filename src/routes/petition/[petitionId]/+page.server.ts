import { fail, redirect } from '@sveltejs/kit';

import type { PetitionId } from '$lib/types/petition.type.js';

import { withActionErrorHandling, withLoadErrorHandling } from '$lib/server/errors.js';
import * as PetitionUsecase from '$lib/usecase/petition.usecase.js';

export const load = withLoadErrorHandling(async ({ params, request, locals }) => {
	const petitionIdRaw = params.petitionId;
	if (!petitionIdRaw) throw new Error('청원 ID가 필요합니다.');
	const petitionId: PetitionId = petitionIdRaw;

	const shouldIncrementView =
		new URL(request.url).searchParams.get('x-sveltekit-invalidated') !== '11';
	const detail = await PetitionUsecase.getPetitionDetail(petitionId, locals.user, {
		incrementView: shouldIncrementView
	});

	return detail;
});

export const actions = {
	deletePetition: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const petitionIdRaw = (formData.get('petition-id') ?? '').toString();
		if (!petitionIdRaw || typeof petitionIdRaw !== 'string') {
			return fail(400, { message: '청원 ID가 없거나 올바르지 않습니다.' });
		}
		const petitionId: PetitionId = petitionIdRaw;
		await PetitionUsecase.deletePetitionById(petitionId, locals.user);
		throw redirect(302, '/petition');
	}),
	signPetition: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const petitionIdRaw = (formData.get('petition-id') ?? '').toString();
		const petitionId: PetitionId = petitionIdRaw;
		const petition = await PetitionUsecase.signPetition(petitionId, locals.user);
		return { petition };
	}),
	unsignPetition: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const petitionIdRaw = (formData.get('petition-id') ?? '').toString();
		const petitionId: PetitionId = petitionIdRaw;
		const petition = await PetitionUsecase.unsignPetition(petitionId, locals.user);
		return { petition };
	}),
	reviewPetition: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const petitionIdRaw = (formData.get('petition-id') ?? '').toString();
		const petitionId: PetitionId = petitionIdRaw;
		const petition = await PetitionUsecase.reviewPetition(petitionId, locals.user);
		return { petition };
	}),
	responseToPetition: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const response = (formData.get('response') ?? '').toString();
		const petitionIdRaw = (formData.get('petition-id') ?? '').toString();
		const petitionId: PetitionId = petitionIdRaw;

		if (!response || !petitionId) return fail(400, { message: '답변 내용은 필수입니다.' });

		const petition = await PetitionUsecase.respondToPetition(petitionId, locals.user, response);
		return { petition };
	}),
	unreviewPetition: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const petitionIdRaw = (formData.get('petition-id') ?? '').toString();
		const petitionId: PetitionId = petitionIdRaw;
		const petition = await PetitionUsecase.unreviewPetition(petitionId, locals.user);
		return { petition };
	}),
	editResponse: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const response = (formData.get('response') ?? '').toString();
		const petitionIdRaw = (formData.get('petition-id') ?? '').toString();
		const petitionId: PetitionId = petitionIdRaw;

		if (!response || !petitionId) return fail(400, { message: '답변 내용은 필수입니다.' });

		const petition = await PetitionUsecase.editPetitionResponse(petitionId, locals.user, response);
		return { petition };
	}),
	deleteResponse: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const petitionIdRaw = (formData.get('petition-id') ?? '').toString();
		const petitionId: PetitionId = petitionIdRaw;
		const petition = await PetitionUsecase.deletePetitionResponse(petitionId, locals.user);
		return { petition };
	})
};
