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
import type { User, UserId, DisplayType } from '$lib/user/types';
import mongoose from 'mongoose';

export default class BoardManager {
	static async getPostById(postId: PostId): Promise<Post> {
		const post = await PostController.getPostById(postId);
		if (!post) throw new Error('존재하지 않는 게시글입니다.');
		return post;
	}

	static async getPostsByBoardId(boardId: BoardId): Promise<Post[]> {
		const posts = await PostController.getPostsByBoardId(boardId);
		if (!posts) throw new Error('게시글이 존재하지 않습니다.');
		return posts;
	}

	static async getCommentById(commentId: CommentId): Promise<Comment> {
		const comment = await CommentController.getCommentById(commentId);
		if (!comment) throw new Error('존재하지 않는 댓글입니다.');
		return comment;
	}

	static async getCommentsByPostId(postId: PostId): Promise<Comment[]> {
		const comments = await CommentController.getCommentsByPostId(postId);
		if (!comments) throw new Error('댓글이 존재하지 않습니다.');
		return comments;
	}

	static async createPostByBoardId(
		boardId: BoardId,
		title: string,
		content: string,
		userId: UserId,
		displayType: DisplayType
	): Promise<Post> {
		const post: PostCreate = {
			boardId,
			title,
			content,
			userId,
			likeCnt: 0,
			likedBy: [],
			viewCnt: 0,
			displayType
		};
		return await PostController.createPost(post);
	}

	static async updatePostById(postId: PostId, post: PostUpdate): Promise<Post> {
		const updatedPost = await PostController.updatePostById(postId, post);
		if (!updatedPost) throw new Error('존재하지 않는 게시글입니다.');
		return updatedPost;
	}

	static async deletePostById(postId: PostId, user: User): Promise<void> {
		return await mongoose.connection.transaction(async () => {
			const post = await this.getPostById(postId);
			if (user._id.toString() !== post.userId.toString())
				throw new Error('이 게시글을 삭제할 수 없습니다.');
			await PostController.deletePostById(postId);
			await CommentController.deleteAllCommentsByPostId(postId);
		});
	}

	static async viewPostById(postId: PostId): Promise<Post> {
		const updatedPost = await PostController.updatePostById(postId, { $inc: { viewCnt: 1 } });
		if (!updatedPost) throw new Error('존재하지 않는 게시글입니다.');
		return updatedPost;
	}

	static async likePostById(postId: PostId, userId: UserId): Promise<Post> {
		const post = await this.getPostById(postId);
		if (post.likedBy.includes(userId)) throw new Error('이미 좋아요를 눌렀습니다.');
		const updatedPost = await PostController.updatePostById(postId, {
			$inc: { likeCnt: 1 },
			$push: { likedBy: userId }
		});
		if (!updatedPost) throw new Error('존재하지 않는 게시글입니다.');
		return updatedPost;
	}

	static async unlikePostById(postId: PostId, userId: UserId): Promise<Post> {
		const post = await this.getPostById(postId);
		if (!post.likedBy.some((id) => id.equals(userId)))
			throw new Error('이미 좋아요를 취소했습니다.');
		const updatedPost = await PostController.updatePostById(postId, {
			$inc: { likeCnt: -1 },
			$pull: { likedBy: userId }
		});
		if (!updatedPost) throw new Error('존재하지 않는 게시글입니다.');
		return updatedPost;
	}

	static async createCommentByPostId(
		postId: PostId,
		content: string,
		userId: UserId,
		displayType: DisplayType
	): Promise<Comment> {
		const comment: CommentCreate = {
			postId,
			content,
			userId,
			likeCnt: 0,
			likedBy: [],
			displayType
		};
		return await CommentController.createComment(comment);
	}

	static async updateCommentById(commentId: CommentId, comment: CommentUpdate): Promise<Comment> {
		const updatedComment = await CommentController.updateCommentById(commentId, comment);
		if (!updatedComment) throw new Error('존재하지 않는 댓글입니다.');
		return updatedComment;
	}

	static async deleteCommentById(commentId: CommentId, user: User): Promise<void> {
		return await mongoose.connection.transaction(async () => {
			const comment = await this.getCommentById(commentId);
			if (user._id.toString() !== comment.userId.toString())
				throw new Error('이 댓글을 삭제할 수 없습니다.');
			await CommentController.deleteCommentById(commentId);
		});
	}

	static async likeCommentById(commentId: CommentId, userId: UserId): Promise<Comment> {
		const comment = await this.getCommentById(commentId);
		if (comment.likedBy.includes(userId)) throw new Error('이미 좋아요를 눌렀습니다.');
		const updatedComment = await CommentController.updateCommentById(commentId, {
			$inc: { likeCnt: 1 },
			$push: { likedBy: userId }
		});
		if (!updatedComment) throw new Error('존재하지 않는 댓글입니다.');
		return updatedComment;
	}

	static async unlikeCommentById(commentId: CommentId, userId: UserId): Promise<Comment> {
		const comment = await this.getCommentById(commentId);
		if (!comment.likedBy.includes(userId)) throw new Error('이미 좋아요를 취소했습니다.');
		const updatedComment = await CommentController.updateCommentById(commentId, {
			$inc: { likeCnt: -1 },
			$pull: { likedBy: userId }
		});
		if (!updatedComment) throw new Error('존재하지 않는 댓글입니다.');
		return updatedComment;
	}
}
