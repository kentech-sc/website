import * as PetitionService from '$lib/srv/petition.srv.js';
import * as PetitionApplication from '$lib/app/petition.app.js';

import type { PetitionId } from '$lib/types/petition.type.js';

import { fail, redirect } from '@sveltejs/kit';
import { Types } from 'mongoose';

import { withActionErrorHandling, withLoadErrorHandling } from '$lib/common/errors.js';

export const load = withLoadErrorHandling(async ({ params, request }) => {
	const petitionIdRaw = params.petitionId;
	const petitionId: PetitionId = new Types.ObjectId(petitionIdRaw);

	if (new URL(request.url).searchParams.get('x-sveltekit-invalidated') !== '11') {
		await PetitionService.viewPetitionById(petitionId);
	}

	const petitionRaw = await PetitionService.getPetitionById(petitionId);
	const petition = (await PetitionApplication.fillRealNamesForPetitions([petitionRaw]))[0];

	const signersNames = await PetitionApplication.getSignersRealNamesByPetition(petition);

	return {
		petition: JSON.stringify(petition),
		signersNames: JSON.stringify(signersNames)
	};
});

export const actions = {
	deletePetition: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const petitionIdRaw = (formData.get('petition-id') ?? '').toString();
		if (!petitionIdRaw || typeof petitionIdRaw !== 'string')
			return fail(400, { message: 'petitionId is undefined or invalid' });
		const petitionId: PetitionId = new Types.ObjectId(petitionIdRaw);
		await PetitionService.deletePetitionById(petitionId, locals.user);
		redirect(302, '/petition');
	}),
	signPetition: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const petitionIdRaw = (formData.get('petition-id') ?? '').toString();
		const petitionId: PetitionId = new Types.ObjectId(petitionIdRaw);
		const petition = await PetitionService.signPetitionById(petitionId, locals.user._id);
		return { petition: JSON.stringify(petition) };
	}),
	unsignPetition: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const petitionIdRaw = (formData.get('petition-id') ?? '').toString();
		const petitionId: PetitionId = new Types.ObjectId(petitionIdRaw);
		const petition = await PetitionService.unsignPetitionById(petitionId, locals.user._id);
		return { petition: JSON.stringify(petition) };
	}),
	reviewPetition: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const petitionIdRaw = (formData.get('petition-id') ?? '').toString();
		const petitionId: PetitionId = new Types.ObjectId(petitionIdRaw);
		const petition = await PetitionService.reviewPetitionById(petitionId, locals.user);
		return { petition: JSON.stringify(petition) };
	}),
	responseToPetition: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const response = (formData.get('response') ?? '').toString();
		const petitionIdRaw = (formData.get('petition-id') ?? '').toString();
		const petitionId = new Types.ObjectId(petitionIdRaw);

		if (!response || !petitionId) return fail(400, { message: 'response is required' });

		const petition = await PetitionService.responseToPetitionById(
			petitionId,
			locals.user,
			response
		);
		return { petition: JSON.stringify(petition) };
	}),
	unreviewPetition: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const petitionIdRaw = (formData.get('petition-id') ?? '').toString();
		const petitionId: PetitionId = new Types.ObjectId(petitionIdRaw);
		const petition = await PetitionService.unreviewPetitionById(petitionId, locals.user);
		return { petition: JSON.stringify(petition) };
	}),
	editResponse: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const response = (formData.get('response') ?? '').toString();
		const petitionIdRaw = (formData.get('petition-id') ?? '').toString();
		const petitionId = new Types.ObjectId(petitionIdRaw);

		if (!response || !petitionId) return fail(400, { message: 'response is required' });

		const petition = await PetitionService.reviseResponseById(petitionId, locals.user, response);
		return { petition: JSON.stringify(petition) };
	}),
	deleteResponse: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const petitionIdRaw = (formData.get('petition-id') ?? '').toString();
		const petitionId: PetitionId = new Types.ObjectId(petitionIdRaw);
		const petition = await PetitionService.deleteResponseById(petitionId, locals.user);
		return { petition: JSON.stringify(petition) };
	})
};
