import type { User } from '$lib/types/user.type.js';
import type { Post, PostCreate } from '$lib/types/post.type.js';
import { BoardId } from '$lib/types/board.type.js';
import { UserGroup } from '$lib/types/user.type.js';

export function canEditOrDeletePost(post: Post, user: User): boolean {
	return (
		post.userId.equals(user._id) ||
		user.group === UserGroup.Moderator ||
		user.group === UserGroup.Manager ||
		user.group === UserGroup.Dev
	);
}

export function canCreatePost(post: PostCreate, user: User): boolean {
	if (post.boardId === BoardId.Notice)
		return (
			user.group === UserGroup.Moderator ||
			user.group === UserGroup.Manager ||
			user.group === UserGroup.Dev
		);
	else return true;
}
