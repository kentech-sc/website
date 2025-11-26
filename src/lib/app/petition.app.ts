import type { Petition } from '$lib/types/petition.type.js';
import type { UserId } from '$lib/types/user.type.js';

import * as UserService from '$lib/srv/user.srv.js';

export async function getSignersRealNamesByPetition(
	petition: Petition
): Promise<Array<string | null>> {
	const users = await UserService.getUsersByIds(petition.signedBy);
	return users.map((user) => (user ? UserService.fillDisplayName(user, 'realName') : null));
}

export async function fillRealNamesForPetitions(petitions: Petition[]): Promise<Petition[]> {
	// 모든 petitionerId / responderId 모으기
	const petitionerIds = petitions.map((p) => p.petitionerId);
	const responderIds = petitions
		.filter((p) => p.responderId !== null)
		.map((p) => p.responderId as UserId);

	// 각각 userId -> User 매핑
	const petitioners = await UserService.getUsersByIds(petitionerIds);
	const responders = await UserService.getUsersByIds(responderIds);

	const petitionerByUserId = new Map(petitionerIds.map((id, i) => [id.toString(), petitioners[i]]));
	const responderByUserId = new Map(responderIds.map((id, i) => [id.toString(), responders[i]]));

	// Petition 배열 갱신
	for (const petition of petitions) {
		const petitioner = petitionerByUserId.get(petition.petitionerId.toString());
		const responder = responderByUserId.get(petition.responderId?.toString() ?? '');

		petition.petitionerName = petitioner
			? UserService.fillDisplayName(petitioner, 'realName')
			: null;
		petition.responderName = responder ? UserService.fillDisplayName(responder, 'realName') : null;
	}

	return petitions;
}
