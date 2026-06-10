import type { BoardId } from '$lib/types/board.type.js';
import type { Page } from '$lib/types/general.type.js';
import type { PostCreate, PostEntity, PostId, PostUpdate } from '$lib/types/post.type.js';
import type { User } from '$lib/types/user.type.js';

import * as PostRepository from '$lib/repositories/post.repository.js';
import * as PostRule from '$lib/rules/post.rule.js';
import { AppError, assertRule } from '$lib/server/errors.js';
import { createPage } from '$lib/shared/paginate.js';
import { APP_ERROR } from '$lib/shared/rule.js';

export function getPostPermissions(post: PostEntity, user: User) {
	const canEditOrDelete = PostRule.canEditOrDeletePost(post, user).ok;

	return {
		canEdit: canEditOrDelete,
		canDelete: canEditOrDelete,
		canLike: PostRule.canLikePost(post, user).ok,
		canUnlike: PostRule.canUnlikePost(post, user).ok
	};
}

export async function getPostById(postId: PostId): Promise<PostEntity> {
	const post = await PostRepository.findPostById(postId);
	if (!post) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 게시글입니다.');
	return post;
}

export async function getPostPageByBoardId(
	boardId: BoardId,
	limit = 10,
	skip = 0
): Promise<Page<PostEntity>> {
	const [result, totalCount] = await Promise.all([
		PostRepository.findRecentPostsByBoardId(boardId, limit, skip),
		PostRepository.countPostsByBoardId(boardId)
	]);
	return createPage<PostEntity>(result, totalCount, limit, skip);
}

export async function createPostByBoardId(postCreate: PostCreate, user: User): Promise<PostEntity> {
	assertRule(PostRule.canCreatePost(postCreate.boardId, user));
	return await PostRepository.createPost(postCreate);
}

export async function editPostById(
	postId: PostId,
	postUpdate: PostUpdate,
	user: User
): Promise<PostEntity> {
	const post = await getPostById(postId);
	assertRule(PostRule.canEditOrDeletePost(post, user));

	const updatedPost = await PostRepository.updatePostById(postId, postUpdate);
	if (!updatedPost) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 게시글입니다.');

	return updatedPost;
}

export async function deletePostById(postId: PostId, user: User): Promise<PostEntity> {
	const post = await getPostById(postId);
	assertRule(PostRule.canEditOrDeletePost(post, user));

	const isDeleted = await PostRepository.deletePostById(postId);
	if (!isDeleted) throw new AppError(APP_ERROR.NOT_FOUND, '이미 삭제된 게시글입니다.');

	return post;
}

export async function viewPostById(postId: PostId): Promise<PostEntity> {
	const updatedPost = await PostRepository.incrementPostViewCntById(postId);
	if (!updatedPost) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 게시글입니다.');
	return updatedPost;
}

export async function incrementCommentCountByPostId(
	postId: PostId,
	increment = 1
): Promise<PostEntity> {
	const updatedPost = await PostRepository.incrementPostCommentCntById(postId, increment);
	if (!updatedPost) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 게시글입니다.');
	return updatedPost;
}

export async function likePostById(postId: PostId, user: User): Promise<PostEntity> {
	const post = await getPostById(postId);
	assertRule(PostRule.canLikePost(post, user));

	const updatedPost = await PostRepository.likePostById(postId, user._id);
	if (!updatedPost) {
		throw new AppError(APP_ERROR.INVALID_STATE, '게시글 상태가 변경되어 좋아요할 수 없습니다.');
	}

	return updatedPost;
}

export async function unlikePostById(postId: PostId, user: User): Promise<PostEntity> {
	const post = await getPostById(postId);
	assertRule(PostRule.canUnlikePost(post, user));

	const updatedPost = await PostRepository.unlikePostById(postId, user._id);
	if (!updatedPost) {
		throw new AppError(
			APP_ERROR.INVALID_STATE,
			'게시글 상태가 변경되어 좋아요를 취소할 수 없습니다.'
		);
	}

	return updatedPost;
}

export async function searchPostsByQuery(
	q: string,
	page = 1,
	limit = 10
): Promise<{ items: PostEntity[]; more: boolean }> {
	return await PostRepository.searchPostsByQuery(q, page, limit);
}
