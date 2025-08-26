import type {
	BoardId,
	PostId,
	PostCreate,
	PostUpdate,
	CommentId,
	CommentCreate,
	CommentUpdate,
	Post,
	Comment
} from './types';
import { PostController, CommentController } from './controller';
import type { User, UserId } from '$lib/user/types';
import mongoose from 'mongoose';
import { fillUserNames } from '$lib/general/user';
import type { ManagerResult } from '$lib/general/types';

export default class BoardManager {
	static async getPostByPostId(postId: PostId): Promise<ManagerResult<Post>> {
		const post = await PostController.getPostByPostId(postId);
		if (!post) return { ok: false, error: '존재하지 않는 게시글입니다.' };
		return { ok: true, value: (await fillUserNames([post]))[0] };
	}

	static async getPostsByBoardId(boardId: BoardId): Promise<ManagerResult<Post[]>> {
		const postArr = await PostController.getPostsByBoardId(boardId);
		return { ok: true, value: await fillUserNames(postArr) };
	}

	static async getCommentsByPostId(postId: PostId): Promise<ManagerResult<Comment[]>> {
		const commentArr = await CommentController.getCommentsByPostId(postId);
		return { ok: true, value: await fillUserNames(commentArr) };
	}

	static async createPostByBoardId(
		boardId: BoardId,
		title: string,
		content: string,
		userId: UserId
	): Promise<ManagerResult<Post>> {
		const post: PostCreate = {
			boardId,
			title,
			content,
			userId,
			likeCnt: 0,
			likedBy: [],
			viewCnt: 0
		};
		return { ok: true, value: await PostController.createPost(post) };
	}

	static async updatePostByPostId(postId: PostId, post: PostUpdate): Promise<ManagerResult<Post>> {
		const updatedPost = await PostController.updatePostByPostId(postId, post);
		if (!updatedPost) return { ok: false, error: '존재하지 않는 게시글입니다.' };
		return { ok: true, value: updatedPost };
	}

	static async deletePostByPostId(postId: PostId, user: User): Promise<ManagerResult<void>> {
		return await mongoose.connection.transaction(async () => {
			const post = await PostController.getPostByPostId(postId);
			if (!post) return { ok: false, error: '존재하지 않는 게시글입니다.' };
			if (user._id.toString() !== post.userId.toString())
				return { ok: false, error: '이 게시글을 삭제할 수 없습니다.' };
			await PostController.deletePostByPostId(postId);
			await CommentController.deleteAllCommentsByPostId(postId);
			return { ok: true };
		});
	}

	static async viewPostByPostId(postId: PostId): Promise<ManagerResult<Post>> {
		const updatedPost = await PostController.updatePostByPostId(postId, { $inc: { viewCnt: 1 } });
		if (!updatedPost) return { ok: false, error: '존재하지 않는 게시글입니다.' };
		return { ok: true, value: updatedPost };
	}

	static async likePostByPostId(postId: PostId, userId: UserId): Promise<ManagerResult<Post>> {
		const post = await PostController.getPostByPostId(postId);
		if (!post) return { ok: false, error: '존재하지 않는 게시글입니다.' };
		if (post.likedBy.includes(userId)) return { ok: false, error: '이미 좋아요를 눌렀습니다.' };
		const updatedPost = await PostController.updatePostByPostId(postId, {
			$inc: { likeCnt: 1 },
			$push: { likedBy: userId }
		});
		if (!updatedPost) return { ok: false, error: '존재하지 않는 게시글입니다.' };
		return { ok: true, value: updatedPost };
	}

	static async unlikePostByPostId(postId: PostId, userId: UserId): Promise<ManagerResult<Post>> {
		const post = await PostController.getPostByPostId(postId);
		if (!post) return { ok: false, error: '존재하지 않는 게시글입니다.' };
		if (!post.likedBy.includes(userId)) return { ok: false, error: '이미 좋아요를 취소했습니다.' };
		const updatedPost = await PostController.updatePostByPostId(postId, {
			$inc: { likeCnt: -1 },
			$pull: { likedBy: userId }
		});
		if (!updatedPost) return { ok: false, error: '존재하지 않는 게시글입니다.' };
		return { ok: true, value: updatedPost };
	}

	static async createCommentByPostId(
		postId: PostId,
		content: string,
		userId: UserId
	): Promise<ManagerResult<Comment>> {
		const comment: CommentCreate = {
			postId,
			content,
			userId,
			likeCnt: 0,
			likedBy: []
		};
		return { ok: true, value: await CommentController.createComment(comment) };
	}

	static async updateCommentByCommentId(
		commentId: CommentId,
		comment: CommentUpdate
	): Promise<ManagerResult<Comment>> {
		const updatedComment = await CommentController.updateCommentByCommentId(commentId, comment);
		if (!updatedComment) return { ok: false, error: '존재하지 않는 댓글입니다.' };
		return { ok: true, value: updatedComment };
	}

	static async deleteCommentByCommentId(
		commentId: CommentId,
		user: User
	): Promise<ManagerResult<void>> {
		return await mongoose.connection.transaction(async () => {
			const comment = await CommentController.getCommentByCommentId(commentId);
			if (!comment) return { ok: false, error: '존재하지 않는 댓글입니다.' };
			if (user._id.toString() !== comment.userId.toString())
				return { ok: false, error: '이 댓글을 삭제할 수 없습니다.' };
			await CommentController.deleteCommentByCommentId(commentId);
			return { ok: true };
		});
	}

	static async likeCommentByCommentId(
		commentId: CommentId,
		userId: UserId
	): Promise<ManagerResult<Comment>> {
		const comment = await CommentController.getCommentByCommentId(commentId);
		if (!comment) return { ok: false, error: '존재하지 않는 댓글입니다.' };
		if (comment.likedBy.includes(userId)) return { ok: false, error: '이미 좋아요를 눌렀습니다.' };
		const updatedComment = await CommentController.updateCommentByCommentId(commentId, {
			$inc: { likeCnt: 1 },
			$push: { likedBy: userId }
		});
		if (!updatedComment) return { ok: false, error: '존재하지 않는 댓글입니다.' };
		return { ok: true, value: updatedComment };
	}

	static async unlikeCommentByCommentId(
		commentId: CommentId,
		userId: UserId
	): Promise<ManagerResult<Comment>> {
		const comment = await CommentController.getCommentByCommentId(commentId);
		if (!comment) return { ok: false, error: '존재하지 않는 댓글입니다.' };
		if (!comment.likedBy.includes(userId))
			return { ok: false, error: '이미 좋아요를 취소했습니다.' };
		const updatedComment = await CommentController.updateCommentByCommentId(commentId, {
			$inc: { likeCnt: -1 },
			$pull: { likedBy: userId }
		});
		if (!updatedComment) return { ok: false, error: '존재하지 않는 댓글입니다.' };
		return { ok: true, value: updatedComment };
	}
}
