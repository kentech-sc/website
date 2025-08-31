import BoardManager from '$lib/board/manager';
import UserManager from '$lib/user/manager.js';
import type { PostId, CommentId } from '$lib/board/types.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { Types } from 'mongoose';

export const load = async ({ params, request }) => {
	const postIdRaw = params.postId;
	if (!postIdRaw || typeof postIdRaw !== 'string')
		error(400, { message: 'postId is undefined or invalid' });
	const postId: PostId = new Types.ObjectId(postIdRaw);

	if (new URL(request.url).searchParams.get('x-sveltekit-invalidated') !== '11') {
		await BoardManager.viewPostById(postId);
	}

	const postRaw = await BoardManager.getPostById(postId);
	const post = (await UserManager.fillDisplayNames([postRaw]))[0];

	const commentsRaw = await BoardManager.getCommentsByPostId(postId);
	const comments = await UserManager.fillDisplayNames(commentsRaw);

	return { post: JSON.stringify(post), comments: JSON.stringify(comments) };
};

export const actions = {
	createComment: async ({ request, locals, params }) => {
		const postIdRaw = params.postId;
		if (!postIdRaw || typeof postIdRaw !== 'string')
			return fail(400, { message: 'postId is undefined or invalid' });
		const postId: PostId = new Types.ObjectId(postIdRaw);
		const formData = await request.formData();
		const content = (formData.get('content') ?? '').toString();

		if (!content) return fail(400, { message: 'content is required' });

		const displayType = (formData.get('displayType') ?? '').toString();

		if (displayType !== 'anonymous' && displayType !== 'nickname' && displayType !== 'realName')
			return fail(400, { message: 'displayType is invalid' });

		const comment = await BoardManager.createCommentByPostId(
			postId,
			content,
			locals.user._id,
			displayType
		);

		return { comment: JSON.stringify(comment) };
	},
	deletePost: async ({ request, locals }) => {
		const formData = await request.formData();
		const postIdRaw = formData.get('post-id');
		if (!postIdRaw || typeof postIdRaw !== 'string')
			return fail(400, { message: 'postId is undefined or invalid' });
		const postId: PostId = new Types.ObjectId(postIdRaw);
		await BoardManager.deletePostById(postId, locals.user);
		redirect(302, '/board');
	},
	deleteComment: async ({ request, locals }) => {
		const formData = await request.formData();
		const commentIdRaw = formData.get('comment-id');
		if (!commentIdRaw || typeof commentIdRaw !== 'string')
			return fail(400, { message: 'commentId is undefined or invalid' });
		const commentId: CommentId = new Types.ObjectId(commentIdRaw);
		await BoardManager.deleteCommentById(commentId, locals.user);
		return { commentIdRaw };
	},
	likePost: async ({ request, locals }) => {
		const formData = await request.formData();
		const postIdRaw = formData.get('post-id');
		if (!postIdRaw || typeof postIdRaw !== 'string')
			return fail(400, { message: 'postId is undefined or invalid' });
		const postId: PostId = new Types.ObjectId(postIdRaw);
		const post = await BoardManager.likePostById(postId, locals.user._id);
		return { post: JSON.stringify(post) };
	},
	unlikePost: async ({ request, locals }) => {
		const formData = await request.formData();
		const postIdRaw = formData.get('post-id');
		if (!postIdRaw || typeof postIdRaw !== 'string')
			return fail(400, { message: 'postId is undefined or invalid' });
		const postId: PostId = new Types.ObjectId(postIdRaw);
		const post = await BoardManager.unlikePostById(postId, locals.user._id);
		return { post: JSON.stringify(post) };
	},
	likeComment: async ({ request, locals }) => {
		const formData = await request.formData();
		const commentIdRaw = formData.get('comment-id');
		if (!commentIdRaw || typeof commentIdRaw !== 'string')
			return fail(400, { message: 'commentId is undefined or invalid' });
		const commentId: CommentId = new Types.ObjectId(commentIdRaw);
		const comment = await BoardManager.likeCommentById(commentId, locals.user._id);
		return { comment: JSON.stringify(comment) };
	},
	unlikeComment: async ({ request, locals }) => {
		const formData = await request.formData();
		const commentIdRaw = formData.get('comment-id');
		if (!commentIdRaw || typeof commentIdRaw !== 'string')
			return fail(400, { message: 'commentId is undefined or invalid' });
		const commentId: CommentId = new Types.ObjectId(commentIdRaw);
		const comment = await BoardManager.unlikeCommentById(commentId, locals.user._id);
		return { comment: JSON.stringify(comment) };
	}
};
