import type { Post, PostId, PostCreate, PostUpdate, PostDoc } from '$lib/types/post.type.js';
import type { User, UserId } from '$lib/types/user.type.js';
import type { BoardId } from '$lib/types/board.type.js';

import { RuleError, SrvError } from '$lib/common/errors.js';

import * as PostRepository from '$lib/repo/post.repo.js';
import * as PostRule from '$lib/rules/post.rule.js';

function toPost(postDoc: PostDoc): Post {
	return {
		...postDoc,
		likeCnt: postDoc.likedBy.length,
		displayName: null
	};
}

export async function getPostById(postId: PostId): Promise<Post> {
	const post = await PostRepository.getPostById(postId);
	if (!post) throw new SrvError('존재하지 않는 게시글입니다.');
	return toPost(post);
}

export async function getPostsByBoardId(
	boardId: BoardId,
	limit = 10,
	{ fromId, toId }: { fromId?: PostId; toId?: PostId } = {}
): Promise<{ pageItems: Post[]; fromId?: PostId; toId?: PostId }> {
	const result = await PostRepository.getPostsByBoardId(boardId, limit, { fromId, toId });
	return {
		...result,
		pageItems: result.pageItems.map(toPost)
	};
}

export async function createPostByBoardId(postCreate: PostCreate, user: User): Promise<Post> {
	if (!PostRule.canCreatePost(postCreate, user))
		throw new RuleError('관리자만 작성할 수 있습니다.');
	return toPost(await PostRepository.createPost(postCreate));
}

export async function editPostById(
	postId: PostId,
	postUpdate: PostUpdate,
	user: User
): Promise<Post> {
	const post = await getPostById(postId);
	if (!PostRule.canEditOrDeletePost(post, user)) throw new RuleError('작성자가 아닙니다.');

	const updatedPost = await PostRepository.updatePostById(postId, postUpdate);
	if (!updatedPost) throw new SrvError('존재하지 않는 게시글입니다.');

	return toPost(updatedPost);
}

export async function deletePostById(postId: PostId, user: User): Promise<Post> {
	const post = await getPostById(postId);
	if (!PostRule.canEditOrDeletePost(post, user)) throw new RuleError('작성자가 아닙니다.');

	const isDeleted = await PostRepository.deletePostById(postId);
	if (!isDeleted) throw new SrvError('이미 삭제된 게시글입니다.');

	return post;
}

export async function viewPostById(postId: PostId): Promise<void> {
	const updatedPost = await PostRepository.updatePostById(postId, { $inc: { viewCnt: 1 } });
	if (!updatedPost) throw new SrvError('존재하지 않는 게시글입니다.');
}

export async function likePostById(postId: PostId, userId: UserId): Promise<Post> {
	const updatedPost = await PostRepository.likePostById(postId, userId);
	if (!updatedPost) throw new SrvError('존재하지 않는 게시글이거나, 이미 좋아요를 눌렀습니다.');
	return toPost(updatedPost);
}

export async function unlikePostById(postId: PostId, userId: UserId): Promise<Post> {
	const updatedPost = await PostRepository.unlikePostById(postId, userId);
	if (!updatedPost) throw new SrvError('존재하지 않는 게시글이거나, 이미 좋아요를 취소했습니다.');
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
