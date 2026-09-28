import type { PostId } from './post.type.js';
import type { UserId, AuthorNameMode } from './user.type.js';

export type CommentId = string;

export interface CommentCreate {
	postId: PostId;
	content: string;
	userId: UserId;
	authorNameMode: AuthorNameMode;
}

export interface CommentEntity extends CommentCreate {
	id: CommentId;
	createdAt: string;
}

export type Comment = CommentEntity & { displayName: string | null };

export interface CommentPermissions {
	canDelete: boolean;
}

export type CommentPermissionMap = Record<string, CommentPermissions>;
