import PetitionService from '$lib/petition/service';
import PetitionApplication from '$lib/applications/petition.js';
import type { PetitionId } from '$lib/petition/types.js';
import { fail, redirect } from '@sveltejs/kit';
import { Types } from 'mongoose';

export const load = async ({ params, request }) => {
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
};

export const actions = {
	deletePetition: async ({ request, locals }) => {
		const formData = await request.formData();
		const petitionIdRaw = (formData.get('petition-id') ?? '').toString();
		if (!petitionIdRaw || typeof petitionIdRaw !== 'string')
			return fail(400, { message: 'petitionId is undefined or invalid' });
		const petitionId: PetitionId = new Types.ObjectId(petitionIdRaw);
		await PetitionService.deletePetitionById(petitionId, locals.user._id);
		redirect(302, '/petition');
	},
	signPetition: async ({ request, locals }) => {
		const formData = await request.formData();
		const petitionIdRaw = (formData.get('petition-id') ?? '').toString();
		const petitionId: PetitionId = new Types.ObjectId(petitionIdRaw);
		const petition = await PetitionService.signPetitionById(petitionId, locals.user._id);
		return { petition: JSON.stringify(petition) };
	},
	unsignPetition: async ({ request, locals }) => {
		const formData = await request.formData();
		const petitionIdRaw = (formData.get('petition-id') ?? '').toString();
		const petitionId: PetitionId = new Types.ObjectId(petitionIdRaw);
		const petition = await PetitionService.unsignPetitionById(petitionId, locals.user._id);
		return { petition: JSON.stringify(petition) };
	},
	reviewPetition: async ({ request, locals }) => {
		const formData = await request.formData();
		const petitionIdRaw = (formData.get('petition-id') ?? '').toString();
		const petitionId: PetitionId = new Types.ObjectId(petitionIdRaw);
		const petition = await PetitionService.reviewPetitionById(petitionId, locals.user._id);
		return { petition: JSON.stringify(petition) };
	},
	responseToPetition: async ({ request, locals }) => {
		const formData = await request.formData();
		const response = (formData.get('response') ?? '').toString();
		const petitionIdRaw = (formData.get('petition-id') ?? '').toString();
		const petitionId = new Types.ObjectId(petitionIdRaw);

		if (!response || !petitionId) return fail(400, { message: 'response is required' });

		const petition = await PetitionService.responseToPetitionById(
			petitionId,
			locals.user._id,
			response
		);
		return { petition: JSON.stringify(petition) };
	},
	deleteResponse: async ({ request, locals }) => {
		const formData = await request.formData();
		const petitionIdRaw = (formData.get('petition-id') ?? '').toString();
		const petitionId: PetitionId = new Types.ObjectId(petitionIdRaw);
		const petition = await PetitionService.deleteResponseById(petitionId, locals.user._id);
		return { petition: JSON.stringify(petition) };
	}
};
