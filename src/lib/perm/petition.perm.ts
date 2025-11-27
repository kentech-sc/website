import { UserGroup } from '$lib/types/user.type.js';
import type { User } from '$lib/types/user.type.js';

import type { Petition } from '$lib/types/petition.type.js';

export function canDeletePetition(petition: Petition, user: User): boolean {
	return petition.petitionerId.equals(user._id) || user.group === UserGroup.Manager;
}

export function canManagePetition(user: User): boolean {
	return user.group === UserGroup.Manager;
}
