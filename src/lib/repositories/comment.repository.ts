import type { CommentId, CommentEntity, CommentCreate } from '$lib/types/comment.type.js';
import type { PostId } from '$lib/types/post.type.js';

import { CommentModel } from '$lib/models/comment.model.js';
import { toPojo } from '$lib/shared/utils.js';

export async function createComment(commentCreate: CommentCreate): Promise<CommentEntity> {
	return toPojo<CommentEntity>((await CommentModel.create(commentCreate)).toObject());
}

export async function findCommentById(commentId: CommentId): Promise<CommentEntity | null> {
	return toPojo<CommentEntity | null>(await CommentModel.findOne({ _id: commentId }).lean());
}

export async function findCommentsByPostId(postId: PostId): Promise<CommentEntity[]> {
	return toPojo<CommentEntity[]>(
		await CommentModel.find({ postId }).sort({ createdAt: -1 }).lean()
	);
}

export async function deleteCommentById(commentId: CommentId): Promise<boolean> {
	const res = await CommentModel.deleteOne({ _id: commentId });
	return res.deletedCount > 0;
}

export async function deleteCommentsByPostId(postId: PostId): Promise<boolean> {
	const res = await CommentModel.deleteMany({ postId });
	return res.deletedCount > 0;
}
