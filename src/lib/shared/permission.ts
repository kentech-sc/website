import type { Capability } from '$lib/types/general.type.js';
import type { User } from '$lib/types/user.type.js';

import { UserGroup, type UserGroup as UserGroupType } from '$lib/types/user.type.js';

const ROLE_CAPABILITIES: Record<UserGroupType, Capability[]> = {
	[UserGroup.Guest]: [],
	[UserGroup.User]: [
		'board.free.write',
		'post.like',
		'comment.write',
		'review.write',
		'petition.write',
		'petition.sign',
		'feedback.write',
		'feedback.support',
		'audit.write'
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
		'push.send',
		'petition.write',
		'petition.sign',
		'feedback.write',
		'feedback.support',
		'audit.write'
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
		'feedback.write',
		'feedback.support',
		'feedback.delete.any',
		'feedback.manage',
		'feedback.respond',
		'audit.write',
		'course.manage',
		'professor.manage',
		'user.manage',
		'push.send',
		'banner.manage'
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
		'feedback.write',
		'feedback.support',
		'feedback.delete.any',
		'feedback.manage',
		'feedback.respond',
		'audit.write',
		'course.manage',
		'professor.manage',
		'user.manage',
		'push.send',
		'banner.manage',
		'system.cleanup'
	],
	[UserGroup.Auditor]: [
		'board.free.write',
		'post.like',
		'comment.write',
		'review.write',
		'petition.write',
		'petition.sign',
		'feedback.write',
		'feedback.support',
		'audit.write',
		'audit.read',
		'audit.manage'
	]
};

export function hasCapability(user: User, capability: Capability): boolean {
	return ROLE_CAPABILITIES[user.group].includes(capability);
}

export function isOwner(user: User, ownerId: unknown): boolean {
	return String(user.id) === String(ownerId);
}
