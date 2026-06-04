import type { Comment, CommentCreate, CommentEntity, CommentId } from '$lib/types/comment.type.js';
import type { PostId } from '$lib/types/post.type.js';
import type { User } from '$lib/types/user.type.js';

import { APP_ERROR } from '$lib/shared/rule.js';
import { AppError, assertRule } from '$lib/server/errors.js';

import * as CommentRepository from '$lib/repositories/comment.repository.js';
import * as CommentRule from '$lib/rules/comment.rule.js';

function toComment(commentEntity: CommentEntity): Comment {
	return {
		...commentEntity,
		likeCnt: commentEntity.likedBy.length,
		displayName: null
	};
}

export function getCommentPermissions(comment: Comment, user: User) {
	return {
		canDelete: CommentRule.canEditOrDeleteComment(comment, user).ok
	};
}

export async function getCommentById(commentId: CommentId): Promise<Comment> {
	const comment = await CommentRepository.findCommentById(commentId);
	if (comment === null) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 댓글입니다.');
	return toComment(comment);
}

export async function getCommentsByPostId(postId: PostId): Promise<Comment[]> {
	return (await CommentRepository.findCommentsByPostId(postId)).map(toComment);
}

export async function createCommentByPostId(
	commentCreate: CommentCreate,
	user: User
): Promise<Comment> {
	assertRule(CommentRule.canCreateComment(commentCreate.content, user));
	return toComment(await CommentRepository.createComment(commentCreate));
}

export async function deleteCommentById(commentId: CommentId, user: User): Promise<Comment> {
	const comment = await getCommentById(commentId);
	assertRule(CommentRule.canEditOrDeleteComment(comment, user));

	const isDeleted = await CommentRepository.deleteCommentById(commentId);
	if (!isDeleted) throw new AppError(APP_ERROR.NOT_FOUND, '이미 삭제된 댓글입니다.');

	return comment;
}

export async function deleteCommentsByPostId(postId: PostId): Promise<void> {
	await CommentRepository.deleteCommentsByPostId(postId);
}
