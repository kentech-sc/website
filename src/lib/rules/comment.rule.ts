import { UserGroup } from '$lib/types/user.type.js';
import type { User } from '$lib/types/user.type.js';
import type { Comment, CommentCreate } from '$lib/types/comment.type.js';

export function canCreateComment(commentCreate: CommentCreate): boolean {
	if (commentCreate.content.trim() === '') return false;
	return true;
}

export function canEditOrDeleteComment(comment: Comment, user: User): boolean {
	return (
		comment.userId.equals(user._id) ||
		user.group === UserGroup.Moderator ||
		user.group === UserGroup.Manager
	);
}
