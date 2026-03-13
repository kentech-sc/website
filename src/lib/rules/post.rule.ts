import type { User } from '$lib/types/user.type.js';
import type { Post, PostCreate } from '$lib/types/post.type.js';
import { BoardId } from '$lib/types/board.type.js';
import { UserGroup } from '$lib/types/user.type.js';
import { hasMinRole } from '$lib/common/permission.js';

export function canEditOrDeletePost(post: Post, user: User): boolean {
	return post.userId.equals(user._id) || hasMinRole(user, UserGroup.Moderator);
}

export function canCreatePost(post: PostCreate, user: User): boolean {
	if (post.boardId === BoardId.Notice) return hasMinRole(user, UserGroup.Moderator);
	else return true;
}
