import { fail, redirect } from '@sveltejs/kit';

import type { CommentId } from '$lib/types/comment.type.js';
import type { PostId } from '$lib/types/post.type.js';

import { withActionErrorHandling, withLoadErrorHandling } from '$lib/server/errors.js';
import { BoardId } from '$lib/types/board.type.js';
import { DisplayType } from '$lib/types/user.type.js';
import * as BoardUsecase from '$lib/usecase/board.usecase.js';

export const load = withLoadErrorHandling(async ({ params, request, locals }) => {
	const postId = params.postId as PostId;
	const shouldIncrementView =
		new URL(request.url).searchParams.get('x-sveltekit-invalidated') !== '11';
	const detail = await BoardUsecase.getPostDetailByPostId(BoardId.Bylaw, postId, locals.user, {
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
	deletePost: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		await BoardUsecase.deletePostById(formData.get('post-id')?.toString() ?? '', locals.user);
		throw redirect(302, '/bylaw');
	}),
	likePost: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		return {
			post: await BoardUsecase.likePost(formData.get('post-id')?.toString() ?? '', locals.user)
		};
	}),
	unlikePost: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		return {
			post: await BoardUsecase.unlikePost(formData.get('post-id')?.toString() ?? '', locals.user)
		};
	}),
	createComment: withActionErrorHandling(async ({ request, locals, params }) => {
		const formData = await request.formData();
		const content = (formData.get('content') ?? '').toString();
		const displayTypeRaw = (formData.get('displayType') ?? '').toString();
		if (!content) return fail(400, { message: '내용은 필수입니다.' });
		if (!Object.values(DisplayType).includes(displayTypeRaw as DisplayType)) {
			return fail(400, { message: '표시 방식이 올바르지 않습니다.' });
		}
		return {
			comment: await BoardUsecase.createCommentAndUpdatePost(
				params.postId as PostId,
				content,
				locals.user,
				displayTypeRaw as DisplayType
			)
		};
	}),
	deleteComment: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const commentIdRaw = formData.get('comment-id')?.toString() ?? '';
		await BoardUsecase.deleteCommentAndUpdatePost(commentIdRaw as CommentId, locals.user);
		return { commentIdRaw };
	})
};
