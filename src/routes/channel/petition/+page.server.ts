import { withLoadErrorHandling } from '$lib/server/errors.js';
import * as PetitionUsecase from '$lib/usecase/petition.usecase.js';

export const load = withLoadErrorHandling(async ({ url, locals }) => {
	const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);
	const petitionResult = await PetitionUsecase.getPetitionPage(page, locals.user);

	return {
		petitionPage: petitionResult.petitionPage,
		filePresence: petitionResult.filePresence,
		canCreatePetition: petitionResult.canCreatePetition
	};
});
