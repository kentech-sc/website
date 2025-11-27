import type { User } from '$lib/types/user.type.js';
import { UserGroup } from '$lib/types/user.type.js';

export function canManageProfessor(user: User): boolean {
	return user.group === UserGroup.Manager;
}
