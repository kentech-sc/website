import * as PostService from '$lib/srv/post.srv.js';
import * as BoardApplication from '$lib/app/board.app.js';

import type { CommentId } from '$lib/types/comment.type.js';
import type { PostId } from '$lib/types/post.type.js';

import { DisplayType } from '$lib/types/user.type.js';

import { withActionErrorHandling, withLoadErrorHandling } from '$lib/common/errors.js';

import { fail, redirect } from '@sveltejs/kit';
import { Types } from 'mongoose';

export const load = withLoadErrorHandling(async ({ params, request }) => {
	const postIdRaw = params.postId;
	const postId: PostId = new Types.ObjectId(postIdRaw);

	if (new URL(request.url).searchParams.get('x-sveltekit-invalidated') !== '11') {
		await PostService.viewPostById(postId);
	}

	const { post, comments, files } = await BoardApplication.getPostDetailByPostId(postId);

	return {
		post: JSON.stringify(post),
		comments: JSON.stringify(comments),
		files: JSON.stringify(files)
	};
});

export const actions = {
	deletePost: withActionErrorHandling(async ({ request, locals, params }) => {
		if (locals.user.group === 'guest')
			return fail(403, { message: '게스트 유저는 게시글을 삭제할 수 없습니다.' });
		const formData = await request.formData();
		const postIdRaw = (formData.get('post-id') ?? '').toString();
		const postId: PostId = new Types.ObjectId(postIdRaw);
		await PostService.deletePostById(postId, locals.user);
		redirect(302, '/board/' + params.boardId);
	}),
	likePost: withActionErrorHandling(async ({ request, locals }) => {
		if (locals.user.group === 'guest')
			return fail(403, { message: '게스트 유저는 좋아요를 누를 수 없습니다.' });
		const formData = await request.formData();
		const postIdRaw = (formData.get('post-id') ?? '').toString();
		const postId: PostId = new Types.ObjectId(postIdRaw);
		const post = await PostService.likePostById(postId, locals.user._id);
		return { post: JSON.stringify(post) };
	}),
	unlikePost: withActionErrorHandling(async ({ request, locals }) => {
		if (locals.user.group === 'guest')
			return fail(403, { message: '게스트 유저는 좋아요를 취소할 수 없습니다.' });
		const formData = await request.formData();
		const postIdRaw = (formData.get('post-id') ?? '').toString();
		const postId: PostId = new Types.ObjectId(postIdRaw);
		const post = await PostService.unlikePostById(postId, locals.user._id);
		return { post: JSON.stringify(post) };
	}),
	createComment: withActionErrorHandling(async ({ request, locals, params }) => {
		if (locals.user.group === 'guest')
			return fail(403, { message: '게스트 유저는 댓글을 작성할 수 없습니다.' });

		const postIdRaw = params.postId;
		const postId: PostId = new Types.ObjectId(postIdRaw);
		const formData = await request.formData();
		const content = (formData.get('content') ?? '').toString();

		if (!content) return fail(400, { message: 'content is required' });

		const displayTypeRaw = (formData.get('displayType') ?? '').toString();

		if (!Object.values(DisplayType).includes(displayTypeRaw as DisplayType))
			return fail(400, { message: 'displayType is invalid' });

		const displayType = displayTypeRaw as DisplayType;

		const comment = await BoardApplication.createCommentAndUpdatePost(
			postId,
			content,
			locals.user._id,
			displayType
		);

		return { comment: JSON.stringify(comment) };
	}),
	// editComment: async ({ request, locals }) => {
	// 	const formData = await request.formData();
	// 	const commentIdRaw = (formData.get('comment-id') ?? '').toString();
	// 	const content = (formData.get('content') ?? '').toString();
	// 	const commentId: CommentId = new Types.ObjectId(commentIdRaw);
	// 	const comment = await BoardService.editCommentById(commentId, { content }, locals.user);
	// 	return { comment: JSON.stringify(comment) };
	// },
	deleteComment: withActionErrorHandling(async ({ request, locals }) => {
		if (locals.user.group === 'guest')
			return fail(403, { message: '게스트 유저는 댓글을 삭제할 수 없습니다.' });
		const formData = await request.formData();
		const commentIdRaw = (formData.get('comment-id') ?? '').toString();
		const commentId: CommentId = new Types.ObjectId(commentIdRaw);
		await BoardApplication.deleteCommentAndUpdatePost(commentId, locals.user);
		return { commentIdRaw };
	})
	// likeComment: async ({ request, locals }) => {
	// 	const formData = await request.formData();
	// 	const commentIdRaw = (formData.get('comment-id') ?? '').toString();
	// 	const commentId: CommentId = new Types.ObjectId(commentIdRaw);
	// 	await BoardService.likeCommentById(commentId, locals.user._id);
	// 	return { commentIdRaw };
	// },
	// unlikeComment: async ({ request, locals }) => {
	// 	const formData = await request.formData();
	// 	const commentIdRaw = (formData.get('comment-id') ?? '').toString();
	// 	const commentId: CommentId = new Types.ObjectId(commentIdRaw);
	// 	await BoardService.unlikeCommentById(commentId, locals.user._id);
	// 	return { commentIdRaw };
	// }
};
