import type { User } from '$lib/types/user.type.js';
import { UserGroup } from '$lib/types/user.type.js';

const ROLE_HIERARCHY: Record<UserGroup, number> = {
	[UserGroup.Guest]: 0,
	[UserGroup.User]: 1,
	[UserGroup.Moderator]: 2,
	[UserGroup.Manager]: 3,
	[UserGroup.Dev]: 4,
};

export function hasMinRole(user: User, minRole: UserGroup): boolean {
	return ROLE_HIERARCHY[user.group] >= ROLE_HIERARCHY[minRole];
}

export function isOwner(user: User, ownerId: unknown): boolean {
	return String(user._id) === String(ownerId);
}
