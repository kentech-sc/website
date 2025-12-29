import type { Types, UpdateQuery } from 'mongoose';

import type { UserId, DisplayType } from './user.type.js';
import type { BoardId } from './board.type.js';
import type { FileId } from './file-meta.type.js';

export type PostId = Types.ObjectId;

export interface PostCreate {
	boardId: BoardId;
	title: string;
	content: string;
	userId: UserId;
	files: FileId[];
	displayType: DisplayType;
}

export interface PostDoc extends PostCreate {
	_id: PostId;
	createdAt: Date;

	viewCnt: number;
	commentCnt: number;
	likedBy: UserId[];
}

export interface Post extends PostDoc {
	likeCnt: number;
	displayName: string | null;
}

export type PostUpdate = UpdateQuery<Pick<PostDoc, 'title' | 'content' | 'viewCnt' | 'commentCnt'>>;
