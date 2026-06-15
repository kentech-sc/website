import type { User } from '$lib/types/user.type.js';

import { UserGroup, type UserGroup as UserGroupType } from '$lib/types/user.type.js';

export type Capability =
	| 'board.free.write'
	| 'board.notice.write'
	| 'board.bylaw.write'
	| 'post.like'
	| 'post.moderate'
	| 'comment.write'
	| 'comment.moderate'
	| 'review.write'
	| 'review.moderate'
	| 'petition.write'
	| 'petition.sign'
	| 'petition.delete.any'
	| 'petition.manage'
	| 'petition.respond'
	| 'course.manage'
	| 'professor.manage'
	| 'user.manage'
	| 'system.cleanup';

const ROLE_CAPABILITIES: Record<UserGroupType, Capability[]> = {
	[UserGroup.Guest]: [],
	[UserGroup.User]: [
		'board.free.write',
		'post.like',
		'comment.write',
		'review.write',
		'petition.write',
		'petition.sign'
	],
	[UserGroup.Moderator]: [
		'board.free.write',
		'board.notice.write',
		'board.bylaw.write',
		'post.like',
		'post.moderate',
		'comment.write',
		'comment.moderate',
		'review.write',
		'petition.write',
		'petition.sign'
	],
	[UserGroup.Manager]: [
		'board.free.write',
		'board.notice.write',
		'board.bylaw.write',
		'post.like',
		'post.moderate',
		'comment.write',
		'comment.moderate',
		'review.write',
		'review.moderate',
		'petition.write',
		'petition.sign',
		'petition.delete.any',
		'petition.manage',
		'petition.respond',
		'course.manage',
		'professor.manage',
		'user.manage'
	],
	[UserGroup.Dev]: [
		'board.free.write',
		'board.notice.write',
		'board.bylaw.write',
		'post.like',
		'post.moderate',
		'comment.write',
		'comment.moderate',
		'review.write',
		'review.moderate',
		'petition.write',
		'petition.sign',
		'petition.delete.any',
		'course.manage',
		'professor.manage',
		'user.manage',
		'system.cleanup'
	]
};

export function hasCapability(user: User, capability: Capability): boolean {
	return ROLE_CAPABILITIES[user.group].includes(capability);
}

export function hasAnyCapability(user: User, capabilities: Capability[]): boolean {
	return capabilities.some((capability) => hasCapability(user, capability));
}

export function isOwner(user: User, ownerId: unknown): boolean {
	return String(user._id) === String(ownerId);
}
