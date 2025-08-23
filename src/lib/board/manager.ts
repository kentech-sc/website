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
} from './type';
import { PostController, CommentController } from './controller';
import type { User, UserId } from '$lib/user/type';
import mongoose from 'mongoose';
import { fillUserNames } from '$lib/utils/user';

export default class BoardManager {
	static async getPostByPostId(postId: PostId): Promise<Post | null> {
		const post = await PostController.getPostByPostId(postId);
		if (!post) return null;
		return (await fillUserNames([post]))[0];
	}

	static async getPostsByBoardId(boardId: BoardId): Promise<Post[]> {
		const postArr = await PostController.getPostsByBoardId(boardId);
		return await fillUserNames(postArr);
	}

	static async getCommentsByPostId(postId: PostId): Promise<Comment[]> {
		const commentArr = await CommentController.getCommentsByPostId(postId);
		return await fillUserNames(commentArr);
	}

	static async createPostByBoardId(
		boardId: BoardId,
		title: string,
		content: string,
		userId: UserId
	): Promise<Post> {
		const post: PostCreate = {
			boardId,
			title,
			content,
			userId
		};
		return await PostController.setPost(post);
	}

	static async updatePostByPostId(postId: PostId, post: PostUpdate): Promise<void> {
		await PostController.updatePostByPostId(postId, post);
	}

	static async deletePostByPostId(postId: PostId, user: User): Promise<void> {
		return await mongoose.connection.transaction(async () => {
			const post = await PostController.getPostByPostId(postId);
			if (!post) return;
			if (user._id.toString() !== post.userId.toString()) return;
			await PostController.deletePostByPostId(postId);
			await CommentController.deleteAllCommentsByPostId(postId);
		});
	}

	static async createCommentByPostId(
		postId: PostId,
		content: string,
		userId: UserId
	): Promise<Comment> {
		const comment: CommentCreate = {
			postId,
			content,
			userId
		};
		return await CommentController.setComment(comment);
	}

	static async updateCommentByCommentId(
		commentId: CommentId,
		comment: CommentUpdate
	): Promise<void> {
		await CommentController.updateCommentByCommentId(commentId, comment);
	}

	static async deleteCommentByCommentId(commentId: CommentId, user: User): Promise<void> {
		return await mongoose.connection.transaction(async () => {
			const comment = await CommentController.getCommentByCommentId(commentId);
			if (!comment) return;
			if (user._id.toString() !== comment.userId.toString()) return;
			await CommentController.deleteCommentByCommentId(commentId);
		});
	}
}
