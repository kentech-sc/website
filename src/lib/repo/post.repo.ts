import type { BoardId, PostId, PostCreate, PostUpdate, Post } from '$lib/types/post.type';
import type { UserId } from '$lib/types/user.type';

import { PostModel } from '$lib/models/post.model.js';

import { paginateModel } from '$lib/common/paginate.js';

export async function createPost(postCreate: PostCreate): Promise<Post> {
	return (await PostModel.create(postCreate)).toObject();
}

export async function getPostById(postId: PostId): Promise<Post | null> {
	return await PostModel.findOne({ _id: postId }).lean();
}

export async function getPostsByBoardId(
	boardId: BoardId,
	limit = 10,
	{ fromId, toId }: { fromId?: PostId; toId?: PostId } = {}
): Promise<{ pageItems: Post[]; fromId?: PostId; toId?: PostId }> {
	return await paginateModel(PostModel, { boardId }, limit, { fromId, toId });
}

export async function updatePostById(postId: PostId, postUpdate: PostUpdate): Promise<Post | null> {
	return await PostModel.findOneAndUpdate({ _id: postId }, postUpdate, { new: true }).lean();
}

export async function deletePostById(postId: PostId): Promise<Post | null> {
	return await PostModel.findOneAndDelete({ _id: postId }).lean();
}

export async function deleteAllPostsByBoardId(boardId: BoardId): Promise<void> {
	await PostModel.deleteMany({ boardId }).lean();
}

export async function likePostById(postId: PostId, userId: UserId): Promise<Post | null> {
	return await PostModel.findOneAndUpdate(
		{ _id: postId, likedBy: { $ne: userId } },
		{ $addToSet: { likedBy: userId }, $inc: { likeCnt: 1 } },
		{ new: true }
	).lean();
}

export async function unlikePostById(postId: PostId, userId: UserId): Promise<Post | null> {
	return await PostModel.findOneAndUpdate(
		{ _id: postId, likedBy: userId },
		{ $pull: { likedBy: userId }, $inc: { likeCnt: -1 } },
		{ new: true }
	).lean();
}

export async function searchPostByQuery(q: string, page = 1, limit = 10): Promise<Post[]> {
	const results = await PostModel.find(
		{ $text: { $search: q } },
		{ searchScore: { $meta: 'textScore' } }
	)
		.sort({ searchScore: { $meta: 'textScore' }, createdAt: -1 })
		.skip((page - 1) * limit)
		.limit(limit + 1)
		.lean();
	return results;
}
