import * as PetitionApplication from '$lib/app/petition.app.js';
import * as PetitionService from '$lib/srv/petition.srv.js';
import * as FileMetaService from '$lib/srv/file-meta.srv.js';
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

	const petitionsWithFiles = await Promise.all(
		petitions.map(async (p) => {
			const files = await FileMetaService.getFileMetasByArticleId(p._id);
			return {
				...p,
				hasImage: files.some((f) => f.mime.startsWith('image/')),
				hasFile: files.some((f) => !f.mime.startsWith('image/'))
			};
		})
	);

	return {
		petitions: JSON.stringify(petitionsWithFiles),
		fromId: petitionsResult.fromId?.toString(),
		toId: petitionsResult.toId?.toString()
	};
});
