import type {
	CommentId,
	CommentDoc,
	CommentCreate,
	CommentUpdate
} from '$lib/types/comment.type.js';
import type { PostId } from '$lib/types/post.type.js';

import * as CommonUtils from '$lib/common/utils.js';
import { CommentModel } from '$lib/models/comment.model.js';

export async function createComment(commentCreate: CommentCreate): Promise<CommentDoc> {
	return (await CommentModel.create(commentCreate)).toObject();
}

export async function getCommentById(commentId: CommentId): Promise<CommentDoc | null> {
	return await CommentModel.findOne({ _id: commentId }).lean();
}

export async function getCommentsByPostId(postId: PostId): Promise<CommentDoc[]> {
	return await CommentModel.find({ postId }).sort({ createdAt: -1 }).lean();
}

export async function getCommentsByPostIds(postIds: PostId[]): Promise<Array<CommentDoc[] | null>> {
	const comments = await CommentModel.find({ postId: { $in: postIds } }).lean();

	const commentsById = new Map<string, CommentDoc[]>();
	for (const comment of comments) {
		CommonUtils.addItemToArrInMap(commentsById, comment.postId.toString(), comment);
	}

	return postIds.map((postId) => commentsById.get(postId.toString()) ?? null);
}

export async function updateCommentById(
	commentId: CommentId,
	commentUpdate: CommentUpdate
): Promise<CommentDoc | null> {
	return await CommentModel.findOneAndUpdate({ _id: commentId }, commentUpdate, {
		new: true
	}).lean();
}

export async function deleteCommentById(commentId: CommentId): Promise<boolean> {
	const res = await CommentModel.deleteOne({ _id: commentId });
	return res.deletedCount > 0;
}

export async function deleteCommentsByPostId(postId: PostId): Promise<boolean> {
	const res = await CommentModel.deleteMany({ postId });
	return res.deletedCount > 0;
}

export async function searchCommentsByQuery(
	q: string,
	page = 1,
	limit = 10
): Promise<CommentDoc[]> {
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
