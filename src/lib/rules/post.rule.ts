import type { User } from '$lib/types/user.type.js';
import type { Post, PostCreate } from '$lib/types/post.type.js';
import { UserGroup } from '$lib/types/user.type.js';
import { BOARD_CONFIG } from '$lib/types/board.type.js';
import { hasMinRole } from '$lib/common/permission.js';

export function canEditOrDeletePost(post: Post, user: User): boolean {
	return post.userId === user._id || hasMinRole(user, UserGroup.Moderator);
}

export function canCreatePost(post: PostCreate, user: User): boolean {
	const config = BOARD_CONFIG[post.boardId];
	if (!config) return false;
	return hasMinRole(user, config.writeMinRole);
}
