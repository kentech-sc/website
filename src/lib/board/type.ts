import type { Types } from 'mongoose';
import type { UserId } from '$lib/user/type';

export type CommentId = Types.ObjectId;

export interface CommentBase {
	postId: PostId;
	content: string;
	userId: UserId;
	userName?: string;
}

export interface Comment extends CommentBase {
	_id: CommentId;
	createdAt: Date;
}

export type CommentCreate = CommentBase;
export type CommentUpdate = Partial<Pick<CommentBase, 'content'>>;

export type PostId = Types.ObjectId;
export type BoardId = string;

export interface PostBase {
	boardId: BoardId;
	title: string;
	content: string;
	userId: UserId;
	userName?: string;
}

export interface Post extends PostBase {
	_id: PostId;
	createdAt: Date;
}

export type PostCreate = PostBase;
export type PostUpdate = Partial<Pick<PostBase, 'title' | 'content'>>;
