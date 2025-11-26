import type { Types, UpdateQuery } from 'mongoose';

import type { UserId, DisplayType } from './user.type.js';
import type { PostId } from './post.type.js';

export type CommentId = Types.ObjectId;

export interface CommentBase {
	postId: PostId;
	content: string;
	userId: UserId;
	likeCnt: number;
	likedBy: UserId[];
	displayType: DisplayType;
	displayName?: string | null;
}

export interface Comment extends CommentBase {
	_id: CommentId;
	createdAt: Date;
}

export type CommentCreate = CommentBase;
export type CommentUpdate = UpdateQuery<Pick<CommentBase, 'content' | 'likeCnt'>>;
