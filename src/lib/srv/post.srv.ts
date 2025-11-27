import mongoose from 'mongoose';

import type { Post, PostId, PostCreate, PostUpdate } from '$lib/types/post.type.js';
import type { User, UserId, DisplayType } from '$lib/types/user.type.js';

import { BoardId } from '$lib/types/board.type.js';

import * as PostRepository from '$lib/repo/post.repo.js';
import * as CommentRepository from '$lib/repo/comment.repo.js';
import * as PostPerm from '$lib/perm/post.perm.js';

export async function getPostById(postId: PostId): Promise<Post> {
	const post = await PostRepository.getPostById(postId);
	if (!post) throw new Error('존재하지 않는 게시글입니다.');
	return post;
}

export async function getPostsByBoardId(
	boardId: BoardId,
	limit = 10,
	{ fromId, toId }: { fromId?: PostId; toId?: PostId } = {}
): Promise<{ pageItems: Post[]; fromId?: PostId; toId?: PostId }> {
	return await PostRepository.getPostsByBoardId(boardId, limit, { fromId, toId });
}

export async function createPostByBoardId(
	boardId: BoardId,
	title: string,
	content: string,
	user: User,
	displayType: DisplayType
): Promise<Post> {
	const post: PostCreate = {
		boardId,
		title,
		content,
		userId: user._id,
		likeCnt: 0,
		likedBy: [],
		viewCnt: 0,
		commentCnt: 0,
		displayType
	};
	if (!PostPerm.canCreatePost(post, user)) throw new Error('관리자만 작성할 수 있습니다.');
	return await PostRepository.createPost(post);
}

export async function editPostById(
	postId: PostId,
	postUpdate: PostUpdate,
	user: User
): Promise<Post> {
	const post = await getPostById(postId);
	if (!PostPerm.canEditOrDeletePost(post, user)) throw new Error('작성자가 아닙니다.');
	const updatedPost = await PostRepository.updatePostById(postId, postUpdate);
	if (!updatedPost) throw new Error('존재하지 않는 게시글입니다.');
	return updatedPost;
}

export async function deletePostById(postId: PostId, user: User): Promise<Post> {
	return await mongoose.connection.transaction(async () => {
		const post = await getPostById(postId);
		if (!PostPerm.canEditOrDeletePost(post, user)) throw new Error('작성자가 아닙니다.');
		const deletedPost = await PostRepository.deletePostById(postId);
		if (!deletedPost) throw new Error('존재하지 않는 게시글입니다.');
		await CommentRepository.deleteAllCommentsByPostId(postId);
		return deletedPost;
	});
}

export async function viewPostById(postId: PostId): Promise<void> {
	await PostRepository.updatePostById(postId, { $inc: { viewCnt: 1 } });
}

export async function likePostById(postId: PostId, userId: UserId): Promise<Post> {
	const updatedPost = await PostRepository.likePostById(postId, userId);
	if (!updatedPost) throw new Error('존재하지 않는 게시글이거나, 이미 좋아요를 눌렀습니다.');
	return updatedPost;
}

export async function unlikePostById(postId: PostId, userId: UserId): Promise<Post> {
	const updatedPost = await PostRepository.unlikePostById(postId, userId);
	if (!updatedPost) throw new Error('존재하지 않는 게시글이거나, 이미 좋아요를 취소했습니다.');
	return updatedPost;
}

export async function searchPostByQuery(
	q: string,
	page = 1,
	limit = 10
): Promise<{ items: Post[]; more: boolean }> {
	const posts = await PostRepository.searchPostByQuery(q, page, limit);
	return { items: posts.slice(0, limit), more: posts.length > limit };
}
