import PetitionApplication from '$lib/applications/petition';
import PetitionService from '$lib/petition/service';
import { Types } from 'mongoose';

export const load = async ({ url }) => {
	const fromIdRaw = url.searchParams.get('from');
	const fromId = fromIdRaw ? new Types.ObjectId(fromIdRaw) : undefined;

	const toIdRaw = url.searchParams.get('to');
	const toId = toIdRaw ? new Types.ObjectId(toIdRaw) : undefined;

	const limit = 10;

	const petitionsResult = await PetitionService.getPetitions(limit, { fromId, toId });
	const petitionsRaw = petitionsResult.pageItems;
	const petitions = await PetitionApplication.fillRealNamesForPetitions(petitionsRaw);

	return {
		petitions: JSON.stringify(petitions),
		fromId: petitionsResult.fromId?.toString(),
		toId: petitionsResult.toId?.toString()
	};
};
