import type { Types, UpdateQuery } from 'mongoose';

import type { UserId, DisplayType } from './user.type.js';
import type { PostId } from './post.type.js';

export type CommentId = Types.ObjectId;

export interface CommentCreate {
	postId: PostId;
	content: string;
	userId: UserId;
	displayType: DisplayType;
}

export interface CommentDoc extends CommentCreate {
	_id: CommentId;
	createdAt: Date;

	likedBy: UserId[];
}

export interface Comment extends CommentDoc {
	likeCnt: number;
	displayName: string | null;
}

export type CommentUpdate = UpdateQuery<Pick<CommentDoc, 'content'>>;
