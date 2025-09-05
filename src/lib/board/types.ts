import type { Types } from 'mongoose';
import type { UserId } from '$lib/user/types';
import type { UpdateQuery } from 'mongoose';
import type { DisplayType } from '$lib/user/types';

export type PostId = Types.ObjectId;
export type BoardId = string | Types.ObjectId;

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
