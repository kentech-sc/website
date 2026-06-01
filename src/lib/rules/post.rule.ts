import type { User } from '$lib/types/user.type.js';
import type { Post, PostCreate } from '$lib/types/post.type.js';
import { BOARD_CONFIG } from '$lib/types/board.type.js';
import { hasMinRole } from '$lib/common/permission.js';

export function canEditOrDeletePost(post: Post, user: User): boolean {
	return post.userId === user._id || hasMinRole(user, 'moderator');
}

export function canCreatePost(post: PostCreate, user: User): boolean {
	return hasMinRole(user, BOARD_CONFIG[post.boardId].writeMinRole);
}
