import type { BoardId } from '$lib/types/board.type.js';
import type { PostId, PostCreate, PostUpdate, PostEntity } from '$lib/types/post.type.js';
import type { UserId } from '$lib/types/user.type.js';

import { PostModel } from '$lib/models/post.model.js';
import { toPojo } from '$lib/shared/utils.js';

export async function countPostsByBoardId(boardId: BoardId): Promise<number> {
	return await PostModel.countDocuments({ boardId });
}

export async function countPostsByQuery(query: string): Promise<number> {
	return await PostModel.countDocuments({ $text: { $search: query } });
}

export async function createPost(postCreate: PostCreate): Promise<PostEntity> {
	return toPojo<PostEntity>((await PostModel.create(postCreate)).toObject());
}

export async function findPostById(postId: PostId): Promise<PostEntity | null> {
	return toPojo<PostEntity | null>(await PostModel.findOne({ _id: postId }).lean());
}

export async function findRecentPostsByBoardId(
	boardId: BoardId,
	limit: number,
	skip = 0
): Promise<Array<PostEntity>> {
	return toPojo<PostEntity[]>(
		await PostModel.find({ boardId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()
	);
}

export async function updatePostById(
	postId: PostId,
	postUpdate: PostUpdate
): Promise<PostEntity | null> {
	return toPojo<PostEntity | null>(
		await PostModel.findOneAndUpdate({ _id: postId }, postUpdate, {
			returnDocument: 'after'
		}).lean()
	);
}

export async function incrementPostViewCntById(postId: PostId): Promise<PostEntity | null> {
	return toPojo<PostEntity | null>(
		await PostModel.findOneAndUpdate(
			{ _id: postId },
			{ $inc: { viewCnt: 1 } },
			{ returnDocument: 'after' }
		).lean()
	);
}

export async function incrementPostCommentCntById(
	postId: PostId,
	increment = 1
): Promise<PostEntity | null> {
	return toPojo<PostEntity | null>(
		await PostModel.findOneAndUpdate(
			{ _id: postId },
			{ $inc: { commentCnt: increment } },
			{ returnDocument: 'after' }
		).lean()
	);
}

export async function deletePostById(postId: PostId): Promise<boolean> {
	const res = await PostModel.deleteOne({ _id: postId });
	return res.deletedCount > 0;
}

export async function likePostById(postId: PostId, userId: UserId): Promise<PostEntity | null> {
	return toPojo<PostEntity | null>(
		await PostModel.findOneAndUpdate(
			{
				_id: postId,
				likedBy: { $ne: userId } // atomic precondition - prevent stale double-like writes
			},
			{ $addToSet: { likedBy: userId } },
			{ returnDocument: 'after' }
		).lean()
	);
}

export async function unlikePostById(postId: PostId, userId: UserId): Promise<PostEntity | null> {
	return toPojo<PostEntity | null>(
		await PostModel.findOneAndUpdate(
			{
				_id: postId,
				likedBy: userId // atomic precondition - prevent stale unlike writes
			},
			{ $pull: { likedBy: userId } },
			{ returnDocument: 'after' }
		).lean()
	);
}

export async function searchPostsByQuery(
	query: string,
	limit = 10,
	skip = 0
): Promise<Array<PostEntity & { searchScore?: number }>> {
	return toPojo<Array<PostEntity & { searchScore?: number }>>(
		await PostModel.find({ $text: { $search: query } }, { searchScore: { $meta: 'textScore' } })
			.sort({ searchScore: { $meta: 'textScore' }, createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean()
	);
}
