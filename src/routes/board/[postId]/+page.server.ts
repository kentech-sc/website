import BoardManager from '$lib/board/manager';
import type { PostId, CommentId } from '$lib/board/type.js';
import { fail, redirect } from '@sveltejs/kit';
import { Types } from 'mongoose';

export const load = async ({ params }) => {
	const postId: unknown = params.postId;
	const post = await BoardManager.getPostByPostId(postId as PostId);
	const commentArr = (await BoardManager.getCommentsByPostId(postId as PostId)).reverse();

	return { post: JSON.stringify(post), commentArr: JSON.stringify(commentArr) };
};

export const actions = {
	createComment: async ({ request, locals, params }) => {
		const postId: unknown = params.postId;
		const formData = await request.formData();
		const content = (formData.get('content') ?? '').toString();

		if (!content) return fail(400, { message: 'content is required' });

		const comment = await BoardManager.createCommentByPostId(
			postId as PostId,
			content,
			locals.user._id
		);
		comment.userName = locals.user.name;
		return {
			comment: JSON.stringify(comment)
		};
	},
	deletePost: async ({ request, locals }) => {
		const formData = await request.formData();
		const postIdRaw = formData.get('post-id');
		if (!postIdRaw || typeof postIdRaw !== 'string')
			return fail(400, { message: 'postId is undefined or invalid' });
		const postId: PostId = new Types.ObjectId(postIdRaw);
		await BoardManager.deletePostByPostId(postId, locals.user);
		redirect(302, '/board');
	},
	deleteComment: async ({ request, locals }) => {
		const formData = await request.formData();
		const commentIdRaw = formData.get('comment-id');
		if (!commentIdRaw || typeof commentIdRaw !== 'string')
			return fail(400, { message: 'commentId is undefined or invalid' });
		const commentId: CommentId = new Types.ObjectId(commentIdRaw);
		await BoardManager.deleteCommentByCommentId(commentId, locals.user);
		return { commentIdRaw };
	}
};
