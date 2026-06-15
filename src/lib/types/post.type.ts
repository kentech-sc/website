import type { BoardId } from './board.type.js';
import type { UserId, DisplayType } from './user.type.js';

export type PostId = string;

export interface PostCreate {
	boardId: BoardId;
	title: string;
	content: string;
	userId: UserId;
	displayType: DisplayType;
}

export interface PostEntity extends PostCreate {
	_id: PostId;
	createdAt: string;

	viewCnt: number;
	commentCnt: number;
	likedBy: UserId[];
}

export type Post = PostEntity & { displayName: string | null };

export interface PostPermissions {
	canEdit: boolean;
	canDelete: boolean;
	canLike: boolean;
	canUnlike: boolean;
}

export type PostUpdate = Partial<
	Pick<PostEntity, 'title' | 'content' | 'viewCnt' | 'commentCnt' | 'displayType'>
>;
