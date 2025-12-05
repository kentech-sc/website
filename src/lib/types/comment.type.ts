import type { Types, UpdateQuery } from 'mongoose';

import type { UserId, DisplayType } from './user.type.js';
import type { PostId } from './post.type.js';

export type CommentId = Types.ObjectId;

export interface CommentBase {
	postId: PostId;
	content: string;
	userId: UserId;
	displayType: DisplayType;

	likeCnt: number;
	likedBy: UserId[];
}

export interface Comment extends CommentBase {
	_id: CommentId;
	createdAt: Date;

	displayName?: string | null;
}

export type CommentCreate = Pick<CommentBase, 'postId' | 'content' | 'userId' | 'displayType'>;
export type CommentUpdate = UpdateQuery<Pick<CommentBase, 'content' | 'likeCnt'>>;
