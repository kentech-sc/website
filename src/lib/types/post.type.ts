import type { Types, UpdateQuery } from 'mongoose';

import type { UserId, DisplayType } from './user.type.js';
import type { BoardId } from './board.type.js';
import type { FileId } from './file-meta.type.js';

export type PostId = Types.ObjectId;

export interface PostBase {
	boardId: BoardId;
	title: string;
	content: string;
	userId: UserId;
	files: FileId[];
	displayType: DisplayType;

	likeCnt: number;
	likedBy: UserId[];
	viewCnt: number;
	commentCnt: number;
}

export interface Post extends PostBase {
	_id: PostId;
	createdAt: Date;

	displayName?: string | null;
}

export type PostCreate = Pick<
	PostBase,
	'boardId' | 'title' | 'content' | 'userId' | 'files' | 'displayType'
>;
export type PostUpdate = UpdateQuery<
	Pick<PostBase, 'title' | 'content' | 'likeCnt' | 'viewCnt' | 'commentCnt'>
>;
