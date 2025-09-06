import BoardService from '$lib/board/service';
import BoardApplication from '$lib/applications/board';
import type { PostId, CommentId } from '$lib/board/types.js';
import { fail, redirect } from '@sveltejs/kit';
import { Types } from 'mongoose';

export const load = async ({ params, request }) => {
	const postIdRaw = params.postId;
	const postId: PostId = new Types.ObjectId(postIdRaw);

	if (new URL(request.url).searchParams.get('x-sveltekit-invalidated') !== '11') {
		await BoardService.viewPostById(postId);
	}

	const { post, comments } = await BoardApplication.getPostAndCommentsByPostId(postId);

	return { post: JSON.stringify(post), comments: JSON.stringify(comments) };
};

export const actions = {
	deletePost: async ({ request, locals }) => {
		const formData = await request.formData();
		const postIdRaw = (formData.get('post-id') ?? '').toString();
		const postId: PostId = new Types.ObjectId(postIdRaw);
		await BoardService.deletePostById(postId, locals.user);
		redirect(302, '/board');
	},
	likePost: async ({ request, locals }) => {
		const formData = await request.formData();
		const postIdRaw = (formData.get('post-id') ?? '').toString();
		const postId: PostId = new Types.ObjectId(postIdRaw);
		const post = await BoardService.likePostById(postId, locals.user._id);
		return { post: JSON.stringify(post) };
	},
	unlikePost: async ({ request, locals }) => {
		const formData = await request.formData();
		const postIdRaw = (formData.get('post-id') ?? '').toString();
		const postId: PostId = new Types.ObjectId(postIdRaw);
		const post = await BoardService.unlikePostById(postId, locals.user._id);
		return { post: JSON.stringify(post) };
	},
	createComment: async ({ request, locals, params }) => {
		const postIdRaw = params.postId;
		const postId: PostId = new Types.ObjectId(postIdRaw);
		const formData = await request.formData();
		const content = (formData.get('content') ?? '').toString();

		if (!content) return fail(400, { message: 'content is required' });

		const displayType = (formData.get('displayType') ?? '').toString();

		if (displayType !== 'anonymous' && displayType !== 'nickname' && displayType !== 'realName')
			return fail(400, { message: 'displayType is invalid' });

		const comment = await BoardService.createCommentByPostId(
			postId,
			content,
			locals.user._id,
			displayType
		);

		return { comment: JSON.stringify(comment) };
	},
	// editComment: async ({ request, locals }) => {
	// 	const formData = await request.formData();
	// 	const commentIdRaw = (formData.get('comment-id') ?? '').toString();
	// 	const content = (formData.get('content') ?? '').toString();
	// 	const commentId: CommentId = new Types.ObjectId(commentIdRaw);
	// 	const comment = await BoardService.editCommentById(commentId, { content }, locals.user);
	// 	return { comment: JSON.stringify(comment) };
	// },
	deleteComment: async ({ request, locals }) => {
		const formData = await request.formData();
		const commentIdRaw = (formData.get('comment-id') ?? '').toString();
		const commentId: CommentId = new Types.ObjectId(commentIdRaw);
		await BoardService.deleteCommentById(commentId, locals.user);
		return { commentIdRaw };
	}
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
