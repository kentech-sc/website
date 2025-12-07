import mongoose from 'mongoose';

import type { BoardId } from '$lib/types/board.type.js';
import type { PostId, Post, PostCreate } from '$lib/types/post.type.js';
import type { Comment, CommentId } from '$lib/types/comment.type.js';
import type { User, UserId, DisplayType } from '$lib/types/user.type.js';
import type { FileMeta, FileId } from '$lib/types/file-meta.type';

import * as PostRepository from '$lib/repo/post.repo.js';
import * as PostService from '$lib/srv/post.srv.js';

import * as CommentRepository from '$lib/repo/comment.repo.js';
import * as CommentService from '$lib/srv/comment.srv.js';

import * as FileMetaService from '$lib/srv/file-meta.srv.js';

import * as UserService from '$lib/srv/user.srv.js';

export async function getPostDetailByPostId(
	postId: PostId
): Promise<{ post: Post; comments: Comment[]; files: Array<FileMeta | null> }> {
	const postRaw = await PostService.getPostById(postId);
	const commentsRaw = (await CommentService.getCommentsByPostId(postId)).toReversed();
	const files = await FileMetaService.getFileMetasByIds(postRaw.files);

	const raws = [postRaw, ...commentsRaw];
	const filled = await UserService.fillDisplayNames(raws);

	const post = filled[0] as Post;
	const comments = filled.slice(1) as Comment[];

	return { post, comments, files };
}

export async function createPost(
	boardId: BoardId,
	title: string,
	content: string,
	user: User,
	displayType: DisplayType,
	fileIds: FileId[]
): Promise<Post> {
	return await mongoose.connection.transaction(async () => {
		const postCreate: PostCreate = {
			boardId,
			title,
			content,
			userId: user._id,
			files: fileIds,
			displayType
		};
		return await PostService.createPostByBoardId(postCreate, user);
	});
}

export async function createCommentAndUpdatePost(
	postId: PostId,
	content: string,
	userId: UserId,
	displayType: DisplayType
) {
	return await mongoose.connection.transaction(async () => {
		await PostRepository.updatePostById(postId, { $inc: { commentCnt: 1 } });
		await CommentService.createCommentByPostId(postId, content, userId, displayType);
	});
}

export async function deleteCommentAndUpdatePost(commentId: CommentId, user: User) {
	return await mongoose.connection.transaction(async () => {
		const deletedComment = await CommentService.deleteCommentById(commentId, user);
		await PostRepository.updatePostById(deletedComment.postId, { $inc: { commentCnt: -1 } });
	});
}

export async function deletePostByPostId(postId: PostId, user: User) {
	return await mongoose.connection.transaction(async () => {
		const deletedPost = await PostService.deletePostById(postId, user);
		await FileMetaService.deleteFilesByIds(deletedPost.files);
		await CommentRepository.deleteAllCommentsByPostId(postId);
	});
}
