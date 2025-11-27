import { UserGroup } from '$lib/types/user.type.js';
import type { User } from '$lib/types/user.type.js';

export function canManageCourse(user: User): boolean {
	return user.group === UserGroup.Manager;
}
