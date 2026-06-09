import { withLoadErrorHandling } from '$lib/server/errors.js';
import * as PetitionUsecase from '$lib/usecase/petition.usecase.js';

export const load = withLoadErrorHandling(async ({ url, locals }) => {
	const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);
	const petitionsResult = await PetitionUsecase.getPetitionPageView(page, locals.user);

	return {
		petitions: petitionsResult.petitions,
		filePresence: petitionsResult.filePresence,
		currentPage: petitionsResult.currentPage,
		totalPages: petitionsResult.totalPages,
		canCreatePetition: petitionsResult.canCreatePetition
	};
});
