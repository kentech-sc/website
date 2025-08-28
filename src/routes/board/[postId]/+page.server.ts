import BoardManager from '$lib/board/manager';
import type { PostId, CommentId } from '$lib/board/types.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { Types } from 'mongoose';

export const load = async ({ params, request }) => {
	const postIdRaw = params.postId;
	if (!postIdRaw || typeof postIdRaw !== 'string')
		error(400, { message: 'postId is undefined or invalid' });
	const postId: PostId = new Types.ObjectId(postIdRaw);

	if (new URL(request.url).searchParams.get('x-sveltekit-invalidated') !== '11') {
		const view_res = await BoardManager.viewPostByPostId(postId);
		if (!view_res.ok) return error(400, { message: view_res.error });
	}

	const post_res = await BoardManager.getPostByPostId(postId);
	if (!post_res.ok) error(400, { message: post_res.error });
	const post = post_res.value;

	const comment_res = await BoardManager.getCommentsByPostId(postId);
	if (!comment_res.ok) error(400, { message: comment_res.error });
	const commentArr = comment_res.value.reverse();

	return { post: JSON.stringify(post), commentArr: JSON.stringify(commentArr) };
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

		const res = await BoardManager.createCommentByPostId(postId, content, locals.user._id);

		if (!res.ok) return fail(400, { message: res.error });

		const comment = res.value;
		comment.userName = locals.user.name;

		return { comment: JSON.stringify(comment) };
	},
	deletePost: async ({ request, locals }) => {
		const formData = await request.formData();
		const postIdRaw = formData.get('post-id');
		if (!postIdRaw || typeof postIdRaw !== 'string')
			return fail(400, { message: 'postId is undefined or invalid' });
		const postId: PostId = new Types.ObjectId(postIdRaw);
		const res = await BoardManager.deletePostByPostId(postId, locals.user);
		if (!res.ok) return fail(400, { message: res.error });
		redirect(302, '/board');
	},
	deleteComment: async ({ request, locals }) => {
		const formData = await request.formData();
		const commentIdRaw = formData.get('comment-id');
		if (!commentIdRaw || typeof commentIdRaw !== 'string')
			return fail(400, { message: 'commentId is undefined or invalid' });
		const commentId: CommentId = new Types.ObjectId(commentIdRaw);
		const res = await BoardManager.deleteCommentByCommentId(commentId, locals.user);
		if (!res.ok) return fail(400, { message: res.error });
		return { commentIdRaw };
	},
	likePost: async ({ request, locals }) => {
		const formData = await request.formData();
		const postIdRaw = formData.get('post-id');
		if (!postIdRaw || typeof postIdRaw !== 'string')
			return fail(400, { message: 'postId is undefined or invalid' });
		const postId: PostId = new Types.ObjectId(postIdRaw);
		const res = await BoardManager.likePostByPostId(postId, locals.user._id);
		if (!res.ok) return fail(400, { message: res.error });
		return { post: JSON.stringify(res.value) };
	},
	unlikePost: async ({ request, locals }) => {
		const formData = await request.formData();
		const postIdRaw = formData.get('post-id');
		if (!postIdRaw || typeof postIdRaw !== 'string')
			return fail(400, { message: 'postId is undefined or invalid' });
		const postId: PostId = new Types.ObjectId(postIdRaw);
		const res = await BoardManager.unlikePostByPostId(postId, locals.user._id);
		if (!res.ok) return fail(400, { message: res.error });
		return { post: JSON.stringify(res.value) };
	},
	likeComment: async ({ request, locals }) => {
		const formData = await request.formData();
		const commentIdRaw = formData.get('comment-id');
		if (!commentIdRaw || typeof commentIdRaw !== 'string')
			return fail(400, { message: 'commentId is undefined or invalid' });
		const commentId: CommentId = new Types.ObjectId(commentIdRaw);
		const res = await BoardManager.likeCommentByCommentId(commentId, locals.user._id);
		if (!res.ok) return fail(400, { message: res.error });
		return { comment: JSON.stringify(res.value) };
	},
	unlikeComment: async ({ request, locals }) => {
		const formData = await request.formData();
		const commentIdRaw = formData.get('comment-id');
		if (!commentIdRaw || typeof commentIdRaw !== 'string')
			return fail(400, { message: 'commentId is undefined or invalid' });
		const commentId: CommentId = new Types.ObjectId(commentIdRaw);
		const res = await BoardManager.unlikeCommentByCommentId(commentId, locals.user._id);
		if (!res.ok) return fail(400, { message: res.error });
		return { comment: JSON.stringify(res.value) };
	}
};
