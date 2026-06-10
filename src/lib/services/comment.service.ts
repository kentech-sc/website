import type { CommentCreate, CommentEntity, CommentId } from '$lib/types/comment.type.js';
import type { PostId } from '$lib/types/post.type.js';
import type { User } from '$lib/types/user.type.js';

import * as CommentRepository from '$lib/repositories/comment.repository.js';
import * as CommentRule from '$lib/rules/comment.rule.js';
import { AppError, assertRule } from '$lib/server/errors.js';
import { APP_ERROR } from '$lib/shared/rule.js';

export function getCommentPermissions(comment: CommentEntity, user: User) {
	return {
		canDelete: CommentRule.canEditOrDeleteComment(comment, user).ok
	};
}

async function getCommentById(commentId: CommentId): Promise<CommentEntity> {
	const comment = await CommentRepository.findCommentById(commentId);
	if (comment === null) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 댓글입니다.');
	return comment;
}

export async function getCommentsByPostId(postId: PostId): Promise<CommentEntity[]> {
	return await CommentRepository.findCommentsByPostId(postId);
}

export async function createCommentByPostId(
	commentCreate: CommentCreate,
	user: User
): Promise<CommentEntity> {
	assertRule(CommentRule.canCreateComment(commentCreate.content, user));
	return await CommentRepository.createComment(commentCreate);
}

export async function deleteCommentById(commentId: CommentId, user: User): Promise<CommentEntity> {
	const comment = await getCommentById(commentId);
	assertRule(CommentRule.canEditOrDeleteComment(comment, user));

	const isDeleted = await CommentRepository.deleteCommentById(commentId);
	if (!isDeleted) throw new AppError(APP_ERROR.NOT_FOUND, '이미 삭제된 댓글입니다.');

	return comment;
}

export async function deleteCommentsByPostId(postId: PostId): Promise<void> {
	await CommentRepository.deleteCommentsByPostId(postId);
}
