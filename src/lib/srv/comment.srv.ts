import type { CommentId, CommentCreate, Comment } from '$lib/types/comment.type.js';
import type { PostId } from '$lib/types/post.type.js';
import type { User, UserId, DisplayType } from '$lib/types/user.type.js';

import * as CommentRepository from '$lib/repo/comment.repo.js';

export async function getCommentById(commentId: CommentId): Promise<Comment> {
	const comment = await CommentRepository.getCommentById(commentId);
	if (!comment) throw new Error('존재하지 않는 댓글입니다.');
	return comment;
}

export async function getCommentsByPostId(postId: PostId): Promise<Comment[]> {
	const comments = await CommentRepository.getAllCommentsByPostId(postId);
	if (!comments) throw new Error('댓글이 존재하지 않습니다.');
	return comments;
}

export async function createCommentByPostId(
	postId: PostId,
	content: string,
	userId: UserId,
	displayType: DisplayType
): Promise<Comment> {
	const comment: CommentCreate = {
		postId,
		content,
		userId,
		likeCnt: 0,
		likedBy: [],
		displayType
	};
	return await CommentRepository.createComment(comment);
}

export function canEditOrDeleteComment(comment: Comment, user: User): boolean {
	return comment.userId.equals(user._id) || user.group === 'moderator' || user.group === 'manager';
}

export async function deleteCommentById(commentId: CommentId, user: User): Promise<Comment> {
	const comment = await getCommentById(commentId);
	if (!canEditOrDeleteComment(comment, user)) throw new Error('작성자가 아닙니다.');
	const deletedComment = await CommentRepository.deleteCommentById(commentId);
	if (!deletedComment) throw new Error('존재하지 않는 댓글입니다.');
	return deletedComment;
}

// static async likeCommentById(commentId: CommentId, userId: UserId): Promise<void> {
// 	const comment = await this.getCommentById(commentId);
// 	if (comment.likedBy.includes(userId)) throw new Error('이미 좋아요를 눌렀습니다.');
// 	await CommentRepository.updateCommentById(commentId, {
// 		$inc: { likeCnt: 1 },
// 		$push: { likedBy: userId }
// 	});
// }

// static async unlikeCommentById(commentId: CommentId, userId: UserId): Promise<void> {
// 	const comment = await this.getCommentById(commentId);
// 	if (!comment.likedBy.includes(userId)) throw new Error('이미 좋아요를 취소했습니다.');
// 	await CommentRepository.updateCommentById(commentId, {
// 		$inc: { likeCnt: -1 },
// 		$pull: { likedBy: userId }
// 	});
// }

// static async searchCommentByQuery(q: string, page=1, limit = 10): Promise<Comment[]> {
// 	return await CommentRepository.searchCommentByQuery(q, page, limit);
// }
