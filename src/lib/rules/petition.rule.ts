import { PetitionStatus } from '$lib/types/petition.type.js';
import { UserGroup } from '$lib/types/user.type.js';
import type { User } from '$lib/types/user.type.js';

import type { Petition } from '$lib/types/petition.type.js';

export function canDeletePetition(petition: Petition, user: User): boolean {
	return petition.petitionerId.equals(user._id) || user.group === UserGroup.Manager;
}

export function canManagePetition(user: User): boolean {
	return user.group === UserGroup.Manager;
}

export function hasResponse(petition: Petition): boolean {
	return petition.responderId !== null;
}

export function isExpired(petition: Petition): boolean {
	return petition.createdAt < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
}

export function getNextStatus(petition: Petition): PetitionStatus {
	if (petition.status !== PetitionStatus.Ongoing) return petition.status;
	if (petition.signCnt >= 30) return PetitionStatus.Pending;
	if (isExpired(petition)) return PetitionStatus.Expired;
	return PetitionStatus.Ongoing;
}
