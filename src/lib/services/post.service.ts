import type { BoardId } from '$lib/types/board.type.js';
import type { Page } from '$lib/types/general.type.js';
import type { Post, PostCreate, PostEntity, PostId, PostUpdate } from '$lib/types/post.type.js';
import type { User } from '$lib/types/user.type.js';

import { createPage } from '$lib/shared/paginate.js';
import { APP_ERROR } from '$lib/shared/rule.js';
import { AppError, assertRule } from '$lib/server/errors.js';

import * as PostRepository from '$lib/repositories/post.repository.js';
import * as PostRule from '$lib/rules/post.rule.js';

function toPost(postEntity: PostEntity): Post {
	return {
		...postEntity,
		likeCnt: postEntity.likedBy.length,
		displayName: null
	};
}

export function getPostPermissions(post: Post, user: User) {
	return {
		canEdit: PostRule.canEditOrDeletePost(post, user).ok,
		canDelete: PostRule.canEditOrDeletePost(post, user).ok,
		canLike: PostRule.canLikePost(user).ok,
		canUnlike: PostRule.canLikePost(user).ok
	};
}

export async function getPostById(postId: PostId): Promise<Post> {
	const post = await PostRepository.findPostById(postId);
	if (!post) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 게시글입니다.');
	return toPost(post);
}

export async function getPostPageByBoardId(
	boardId: BoardId,
	limit = 10,
	skip = 0
): Promise<Page<Post>> {
	const [result, totalCount] = await Promise.all([
		PostRepository.findRecentPostsByBoardId(boardId, limit, skip),
		PostRepository.countPostsByBoardId(boardId)
	]);
	return createPage<Post>(result.map(toPost), totalCount, limit, skip);
}

export async function createPostByBoardId(postCreate: PostCreate, user: User): Promise<Post> {
	assertRule(PostRule.canCreatePost(postCreate.boardId, user));
	return toPost(await PostRepository.createPost(postCreate));
}

export async function editPostById(
	postId: PostId,
	postUpdate: PostUpdate,
	user: User
): Promise<Post> {
	const post = await getPostById(postId);
	assertRule(PostRule.canEditOrDeletePost(post, user));

	const updatedPost = await PostRepository.updatePostById(postId, postUpdate);
	if (!updatedPost) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 게시글입니다.');

	return toPost(updatedPost);
}

export async function deletePostById(postId: PostId, user: User): Promise<Post> {
	const post = await getPostById(postId);
	assertRule(PostRule.canEditOrDeletePost(post, user));

	const isDeleted = await PostRepository.deletePostById(postId);
	if (!isDeleted) throw new AppError(APP_ERROR.NOT_FOUND, '이미 삭제된 게시글입니다.');

	return post;
}

export async function viewPostById(postId: PostId): Promise<void> {
	const updatedPost = await PostRepository.incrementPostViewCntById(postId);
	if (!updatedPost) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 게시글입니다.');
}

export async function incrementCommentCountByPostId(postId: PostId, increment = 1): Promise<Post> {
	const updatedPost = await PostRepository.incrementPostCommentCntById(postId, increment);
	if (!updatedPost) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 게시글입니다.');
	return toPost(updatedPost);
}

export async function likePostById(postId: PostId, user: User): Promise<Post> {
	assertRule(PostRule.canLikePost(user));

	const post = await getPostById(postId);
	if (post.likedBy.includes(user._id)) {
		throw new AppError(APP_ERROR.INVALID_STATE, '이미 좋아요를 누른 게시글입니다.');
	}

	const updatedPost = await PostRepository.likePostById(postId, user._id);
	if (!updatedPost) {
		throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 게시글입니다.');
	}

	return toPost(updatedPost);
}

export async function unlikePostById(postId: PostId, user: User): Promise<Post> {
	assertRule(PostRule.canLikePost(user));

	const post = await getPostById(postId);

	if (!post.likedBy.includes(user._id)) {
		throw new AppError(APP_ERROR.INVALID_STATE, '좋아요를 누르지 않은 게시글입니다.');
	}

	const updatedPost = await PostRepository.unlikePostById(postId, user._id);
	if (!updatedPost) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 게시글입니다.');

	return toPost(updatedPost);
}

export async function searchPostsByQuery(
	q: string,
	page = 1,
	limit = 10
): Promise<{ items: Post[]; more: boolean }> {
	const { items, more } = await PostRepository.searchPostsByQuery(q, page, limit);
	return { items: items.map(toPost), more };
}
