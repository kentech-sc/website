import type { Comment, CommentId, CommentCreate, CommentUpdate } from '$lib/types/comment.type.js';
import type { PostId } from '$lib/types/post.type.js';

import * as CommonUtils from '$lib/common/utils.js';
import { CommentModel } from '$lib/models/comment.model.js';

export async function createComment(commentCreate: CommentCreate): Promise<Comment> {
	return (await CommentModel.create(commentCreate)).toObject();
}

export async function getCommentById(commentId: CommentId): Promise<Comment | null> {
	return await CommentModel.findOne({ _id: commentId }).lean();
}

export async function getAllCommentsByPostId(postId: PostId): Promise<Comment[]> {
	return await CommentModel.find({ postId }).sort({ createdAt: -1 }).lean();
}

export async function getCommentsByPostIds(postIds: PostId[]): Promise<Array<Comment[] | null>> {
	const comments = await CommentModel.find({ postId: { $in: postIds } }).lean();

	const commentsById = new Map<string, Comment[]>();
	for (const comment of comments) {
		CommonUtils.addItemToArrInMap(commentsById, comment.postId.toString(), comment);
	}

	return postIds.map((postId) => commentsById.get(postId.toString()) ?? null);
}

export async function updateCommentById(
	commentId: CommentId,
	commentUpdate: CommentUpdate
): Promise<Comment | null> {
	return await CommentModel.findOneAndUpdate({ _id: commentId }, commentUpdate, {
		new: true
	}).lean();
}

export async function deleteCommentById(commentId: CommentId): Promise<Comment | null> {
	const comment = await CommentModel.findOneAndDelete({ _id: commentId }).lean();
	if (!comment) return null;
	return comment;
}

export async function deleteAllCommentsByPostId(postId: PostId): Promise<void> {
	await CommentModel.deleteMany({ postId });
}

export async function searchCommentByQuery(q: string, page = 1, limit = 10): Promise<Comment[]> {
	const results = await CommentModel.find(
		{ $text: { $search: q } },
		{ searchScore: { $meta: 'textScore' } }
	)
		.sort({ searchScore: { $meta: 'textScore' } })
		.skip((page - 1) * limit)
		.limit(limit + 1)
		.lean();
	return results;
}
