import type {
	CommentId,
	CommentEntity,
	CommentCreate,
	CommentUpdate
} from '$lib/types/comment.type.js';
import type { PostId } from '$lib/types/post.type.js';

import * as SharedUtils from '$lib/shared/utils.js';
import { CommentModel } from '$lib/models/comment.model.js';

export async function createComment(commentCreate: CommentCreate): Promise<CommentEntity> {
	return SharedUtils.toPojo<CommentEntity>((await CommentModel.create(commentCreate)).toObject());
}

export async function findCommentById(commentId: CommentId): Promise<CommentEntity | null> {
	return SharedUtils.toPojo<CommentEntity | null>(
		await CommentModel.findOne({ _id: commentId }).lean()
	);
}

export async function findCommentsByPostId(postId: PostId): Promise<CommentEntity[]> {
	return SharedUtils.toPojo<CommentEntity[]>(
		await CommentModel.find({ postId }).sort({ createdAt: -1 }).lean()
	);
}

export async function findCommentsByPostIds(
	postIds: PostId[]
): Promise<Array<CommentEntity[] | null>> {
	const comments = await CommentModel.find({ postId: { $in: postIds } }).lean();

	const postIdToComments = new Map<string, CommentEntity[]>();
	for (const comment of comments) {
		SharedUtils.appendValueByKey(postIdToComments, comment.postId.toString(), comment);
	}

	return SharedUtils.toPojo<Array<CommentEntity[] | null>>(
		postIds.map((postId) => postIdToComments.get(postId.toString()) ?? null)
	);
}

export async function updateCommentById(
	commentId: CommentId,
	commentUpdate: CommentUpdate
): Promise<CommentEntity | null> {
	return SharedUtils.toPojo<CommentEntity | null>(
		await CommentModel.findOneAndUpdate({ _id: commentId }, commentUpdate, {
			returnDocument: 'after'
		}).lean()
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