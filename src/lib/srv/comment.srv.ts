import type { CommentId, CommentCreate, Comment, CommentDoc } from '$lib/types/comment.type.js';
import type { PostId } from '$lib/types/post.type.js';
import type { User } from '$lib/types/user.type.js';

import * as CommentRepository from '$lib/repo/comment.repo.js';
import * as CommentRule from '$lib/rules/comment.rule.js';

import { RuleError, SrvError } from '$lib/common/errors.js';

function toComment(commentDoc: CommentDoc): Comment {
	return {
		...commentDoc,
		likeCnt: commentDoc.likedBy.length,
		displayName: null
	};
}

export async function getCommentById(commentId: CommentId): Promise<Comment> {
	const comment = await CommentRepository.getCommentById(commentId);
	if (comment === null) throw new SrvError('존재하지 않는 댓글입니다.');
	return toComment(comment);
}

export async function getCommentsByPostId(postId: PostId): Promise<Comment[]> {
	return (await CommentRepository.getCommentsByPostId(postId)).map(toComment);
}

export async function createCommentByPostId(commentCreate: CommentCreate): Promise<Comment> {
	if (!CommentRule.canCreateComment(commentCreate))
		throw new RuleError('댓글의 내용을 작성해 주세요.');
	return toComment(await CommentRepository.createComment(commentCreate));
}

export async function deleteCommentById(commentId: CommentId, user: User): Promise<Comment> {
	const comment = await getCommentById(commentId);

	if (!CommentRule.canEditOrDeleteComment(comment, user)) throw new RuleError('작성자가 아닙니다.');

	const isDeleted = await CommentRepository.deleteCommentById(commentId);
	if (!isDeleted) throw new SrvError('이미 삭제된 댓글입니다.');

	return comment;
}
