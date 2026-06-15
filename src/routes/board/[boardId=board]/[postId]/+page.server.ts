import { fail, redirect } from '@sveltejs/kit';

import type { CommentId } from '$lib/types/comment.type.js';
import type { PostId } from '$lib/types/post.type.js';

import { withActionErrorHandling, withLoadErrorHandling } from '$lib/server/errors.js';
import { DisplayType } from '$lib/types/user.type.js';
import * as BoardUsecase from '$lib/usecase/board.usecase.js';

export const load = withLoadErrorHandling(async ({ params, request, locals }) => {
	const postIdRaw = params.postId;
	if (!postIdRaw) throw new Error('게시글 ID가 필요합니다.');
	const postId: PostId = postIdRaw;

	const shouldIncrementView =
		new URL(request.url).searchParams.get('x-sveltekit-invalidated') !== '11';
	const detail = await BoardUsecase.getPostDetailByPostId(postId, locals.user, {
		incrementView: shouldIncrementView
	});

	return {
		post: detail.post,
		comments: detail.comments,
		files: detail.files,
		postPermissions: detail.postPermissions,
		commentPermissions: detail.commentPermissions,
		canCreateComment: detail.canCreateComment
	};
});

export const actions = {
	deletePost: withActionErrorHandling(async ({ request, locals, params }) => {
		const formData = await request.formData();
		const postIdRaw = (formData.get('post-id') ?? '').toString();
		const postId: PostId = postIdRaw;
		await BoardUsecase.deletePostById(postId, locals.user);
		throw redirect(302, '/board/' + params.boardId);
	}),
	likePost: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const postIdRaw = (formData.get('post-id') ?? '').toString();
		const postId: PostId = postIdRaw;
		const post = await BoardUsecase.likePost(postId, locals.user);
		return { post };
	}),
	unlikePost: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const postIdRaw = (formData.get('post-id') ?? '').toString();
		const postId: PostId = postIdRaw;
		const post = await BoardUsecase.unlikePost(postId, locals.user);
		return { post };
	}),
	createComment: withActionErrorHandling(async ({ request, locals, params }) => {
		const postIdRaw = params.postId;
		if (!postIdRaw) return fail(400, { message: '게시글 ID가 필요합니다.' });
		const postId: PostId = postIdRaw;
		const formData = await request.formData();
		const content = (formData.get('content') ?? '').toString();
		if (!content) return fail(400, { message: '내용은 필수입니다.' });

		const displayTypeRaw = (formData.get('displayType') ?? '').toString();
		if (!Object.values(DisplayType).includes(displayTypeRaw as DisplayType)) {
			return fail(400, { message: '표시 방식이 올바르지 않습니다.' });
		}

		const comment = await BoardUsecase.createCommentAndUpdatePost(
			postId,
			content,
			locals.user,
			displayTypeRaw as DisplayType
		);

		return { comment };
	}),
	deleteComment: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const commentIdRaw = (formData.get('comment-id') ?? '').toString();
		const commentId: CommentId = commentIdRaw;
		await BoardUsecase.deleteCommentAndUpdatePost(commentId, locals.user);
		return { commentIdRaw };
	})
};
