import type { PostId, Post } from '$lib/types/post.type.js';
import type { Comment, CommentId } from '$lib/types/comment.type.js';
import type { User, UserId, DisplayType } from '$lib/types/user.type.js';

import * as PostService from '$lib/srv/post.srv.js';
import * as PostRepository from '$lib/repo/post.repo.js';
import * as CommentService from '$lib/srv/comment.srv.js';
import * as UserService from '$lib/srv/user.srv.js';

export async function getPostAndCommentsByPostId(
	postId: PostId
): Promise<{ post: Post; comments: Comment[] }> {
	const postRaw = await PostService.getPostById(postId);
	const commentsRaw = (await CommentService.getCommentsByPostId(postId)).toReversed();

	const raws = [postRaw, ...commentsRaw];
	const filled = await UserService.fillDisplayNames(raws);

	const post = filled[0] as Post;
	const comments = filled.slice(1) as Comment[];

	return { post, comments };
}

export async function createCommentAndUpdatePost(
	postId: PostId,
	content: string,
	userId: UserId,
	displayType: DisplayType
) {
	await PostRepository.updatePostById(postId, { $inc: { commentCnt: 1 } });
	await CommentService.createCommentByPostId(postId, content, userId, displayType);
}

export async function deleteCommentAndUpdatePost(commentId: CommentId, user: User) {
	const deletedComment = await CommentService.deleteCommentById(commentId, user);
	await PostRepository.updatePostById(deletedComment.postId, { $inc: { commentCnt: -1 } });
}
