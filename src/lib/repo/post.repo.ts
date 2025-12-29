import type { BoardId } from '$lib/types/board.type.js';
import type { PostId, PostCreate, PostUpdate, PostDoc } from '$lib/types/post.type.js';
import type { UserId } from '$lib/types/user.type.js';

import { PostModel } from '$lib/models/post.model.js';

import { paginateModel } from '$lib/common/paginate.js';

export async function createPost(postCreate: PostCreate): Promise<PostDoc> {
	return (await PostModel.create(postCreate)).toObject();
}

export async function getPostById(postId: PostId): Promise<PostDoc | null> {
	return await PostModel.findOne({ _id: postId }).lean();
}

export async function getPostsByBoardId(
	boardId: BoardId,
	limit = 10,
	{ fromId, toId }: { fromId?: PostId; toId?: PostId } = {}
): Promise<{ pageItems: PostDoc[]; fromId?: PostId; toId?: PostId }> {
	return await paginateModel(PostModel, { boardId }, limit, { fromId, toId });
}

export async function updatePostById(
	postId: PostId,
	postUpdate: PostUpdate
): Promise<PostDoc | null> {
	return await PostModel.findOneAndUpdate({ _id: postId }, postUpdate, { new: true }).lean();
}

export async function deletePostById(postId: PostId): Promise<boolean> {
	const res = await PostModel.deleteOne({ _id: postId });
	return res.deletedCount > 0;
}

export async function deleteAllPostsByBoardId(boardId: BoardId): Promise<boolean> {
	const res = await PostModel.deleteMany({ boardId });
	return res.deletedCount > 0;
}

export async function likePostById(postId: PostId, userId: UserId): Promise<PostDoc | null> {
	return await PostModel.findOneAndUpdate(
		{
			_id: postId,
			likedBy: { $ne: userId } // write-guard for UX performance - prevent double liking
		},
		{ $addToSet: { likedBy: userId } },
		{ new: true }
	).lean();
}

export async function unlikePostById(postId: PostId, userId: UserId): Promise<PostDoc | null> {
	return await PostModel.findOneAndUpdate(
		{ _id: postId },
		{ $pull: { likedBy: userId } },
		{ new: true }
	).lean();
}

export async function searchPostsByQuery(
	q: string,
	page = 1,
	limit = 10
): Promise<{ items: PostDoc[]; more: boolean }> {
	const results = await PostModel.find(
		{ $text: { $search: q } },
		{ searchScore: { $meta: 'textScore' } }
	)
		.sort({ searchScore: { $meta: 'textScore' }, createdAt: -1 })
		.skip((page - 1) * limit)
		.limit(limit + 1)
		.lean();

	return { items: results.slice(0, limit), more: results.length > limit };
}
