import type { Types, UpdateQuery } from 'mongoose';

import type { UserId, DisplayType } from './user.type.js';
import type { BoardId } from './board.type.js';

export type PostId = Types.ObjectId;

export interface PostBase {
	boardId: BoardId;
	title: string;
	content: string;
	userId: UserId;
	likeCnt: number;
	likedBy: UserId[];
	viewCnt: number;
	commentCnt: number;
	displayType: DisplayType;
	displayName?: string | null;
}

export interface Post extends PostBase {
	_id: PostId;
	createdAt: Date;
}

export type PostCreate = PostBase;
export type PostUpdate = UpdateQuery<
	Pick<PostBase, 'title' | 'content' | 'likeCnt' | 'viewCnt' | 'commentCnt'>
>;
