import PetitionApplication from '$lib/applications/petition';
import PetitionService from '$lib/petition/service';

export const load = async () => {
	const petitionsRaw = await PetitionService.getAllPetitions();
	const petitions = await PetitionApplication.fillRealNamesForPetitions(petitionsRaw);

	return {
		petitions: JSON.stringify(petitions)
	};
};
