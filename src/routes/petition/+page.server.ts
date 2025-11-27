import * as PetitionApplication from '$lib/app/petition.app.js';
import * as PetitionService from '$lib/srv/petition.srv.js';
import { Types } from 'mongoose';

import { withLoadErrorHandling } from '$lib/common/errors.js';

export const load = withLoadErrorHandling(async ({ url }) => {
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
});
