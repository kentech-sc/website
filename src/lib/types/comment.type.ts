import type { UserId, DisplayType } from './user.type.js';
import type { PostId } from './post.type.js';

export type CommentId = string;

export interface CommentCreate {
	postId: PostId;
	content: string;
	userId: UserId;
	displayType: DisplayType;
}

export interface CommentEntity extends CommentCreate {
	_id: CommentId;
	createdAt: Date;

	likedBy: UserId[];
}

export interface Comment extends CommentEntity {
	likeCnt: number;
	displayName: string | null;
}

export interface CommentPermissions {
	canDelete: boolean;
}

export type CommentPermissionMap = Record<string, CommentPermissions>;

export type CommentUpdate = Partial<Pick<CommentEntity, 'content'>>;
