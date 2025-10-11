import type {
	BoardId,
	PostId,
	PostCreate,
	PostUpdate,
	CommentId,
	CommentCreate,
	Post,
	Comment
} from './types';
import { PostRepository, CommentRepository } from './repository';
import type { User, UserId, DisplayType } from '$lib/user/types';
import mongoose from 'mongoose';

export default class BoardService {
	static async getPostById(postId: PostId): Promise<Post> {
		const post = await PostRepository.getPostById(postId);
		if (!post) throw new Error('존재하지 않는 게시글입니다.');
		return post;
	}

	static async getPostsByBoardId(
		boardId: BoardId,
		limit = 10,
		{ fromId, toId }: { fromId?: PostId; toId?: PostId } = {}
	): Promise<{ pageItems: Post[]; fromId?: PostId; toId?: PostId }> {
		return await PostRepository.getPostsByBoardId(boardId, limit, { fromId, toId });
	}

	static async getCommentById(commentId: CommentId): Promise<Comment> {
		const comment = await CommentRepository.getCommentById(commentId);
		if (!comment) throw new Error('존재하지 않는 댓글입니다.');
		return comment;
	}

	static async getCommentsByPostId(postId: PostId): Promise<Comment[]> {
		const comments = await CommentRepository.getAllCommentsByPostId(postId);
		if (!comments) throw new Error('댓글이 존재하지 않습니다.');
		return comments;
	}

	static #canEditOrDeletePost(post: Post, user: User): boolean {
		return post.userId.equals(user._id) || user.group === 'moderator' || user.group === 'manager';
	}

	static #canCreatePost(post: PostCreate, user: User): boolean {
		if (post.boardId === 'notice') return user.group === 'moderator' || user.group === 'manager';
		else return true;
	}

	static async createPostByBoardId(
		boardId: BoardId,
		title: string,
		content: string,
		user: User,
		displayType: DisplayType
	): Promise<Post> {
		const post: PostCreate = {
			boardId,
			title,
			content,
			userId: user._id,
			likeCnt: 0,
			likedBy: [],
			viewCnt: 0,
			commentCnt: 0,
			displayType
		};
		if (!this.#canCreatePost(post, user)) throw new Error('관리자만 작성할 수 있습니다.');
		return await PostRepository.createPost(post);
	}

	static async editPostById(postId: PostId, postUpdate: PostUpdate, user: User): Promise<Post> {
		const post = await this.getPostById(postId);
		if (!this.#canEditOrDeletePost(post, user)) throw new Error('작성자가 아닙니다.');
		const updatedPost = await PostRepository.updatePostById(postId, postUpdate);
		if (!updatedPost) throw new Error('존재하지 않는 게시글입니다.');
		return updatedPost;
	}

	static async deletePostById(postId: PostId, user: User): Promise<Post> {
		return await mongoose.connection.transaction(async () => {
			const post = await this.getPostById(postId);
			if (!this.#canEditOrDeletePost(post, user)) throw new Error('작성자가 아닙니다.');
			const deletedPost = await PostRepository.deletePostById(postId);
			if (!deletedPost) throw new Error('존재하지 않는 게시글입니다.');
			await CommentRepository.deleteAllCommentsByPostId(postId);
			return deletedPost;
		});
	}

	static async viewPostById(postId: PostId): Promise<void> {
		await PostRepository.updatePostById(postId, { $inc: { viewCnt: 1 } });
	}

	static async likePostById(postId: PostId, userId: UserId): Promise<Post> {
		const updatedPost = await PostRepository.likePostById(postId, userId);
		if (!updatedPost) throw new Error('존재하지 않는 게시글이거나, 이미 좋아요를 눌렀습니다.');
		return updatedPost;
	}

	static async unlikePostById(postId: PostId, userId: UserId): Promise<Post> {
		const updatedPost = await PostRepository.unlikePostById(postId, userId);
		if (!updatedPost) throw new Error('존재하지 않는 게시글이거나, 이미 좋아요를 취소했습니다.');
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
		return await CommentRepository.createComment(comment);
	}

	static #canEditOrDeleteComment(comment: Comment, user: User): boolean {
		return (
			comment.userId.equals(user._id) || user.group === 'moderator' || user.group === 'manager'
		);
	}

	static async deleteCommentById(commentId: CommentId, user: User): Promise<Comment> {
		const comment = await this.getCommentById(commentId);
		if (!this.#canEditOrDeleteComment(comment, user)) throw new Error('작성자가 아닙니다.');
		const deletedComment = await CommentRepository.deleteCommentById(commentId);
		if (!deletedComment) throw new Error('존재하지 않는 댓글입니다.');
		return deletedComment;
	}

	// static async likeCommentById(commentId: CommentId, userId: UserId): Promise<void> {
	// 	const comment = await this.getCommentById(commentId);
	// 	if (comment.likedBy.includes(userId)) throw new Error('이미 좋아요를 눌렀습니다.');
	// 	await CommentRepository.updateCommentById(commentId, {
	// 		$inc: { likeCnt: 1 },
	// 		$push: { likedBy: userId }
	// 	});
	// }

	// static async unlikeCommentById(commentId: CommentId, userId: UserId): Promise<void> {
	// 	const comment = await this.getCommentById(commentId);
	// 	if (!comment.likedBy.includes(userId)) throw new Error('이미 좋아요를 취소했습니다.');
	// 	await CommentRepository.updateCommentById(commentId, {
	// 		$inc: { likeCnt: -1 },
	// 		$pull: { likedBy: userId }
	// 	});
	// }

	static async searchPostByQuery(
		q: string,
		page = 1,
		limit = 10
	): Promise<{ items: Post[]; more: boolean }> {
		const posts = await PostRepository.searchPostByQuery(q, page, limit);
		return { items: posts.slice(0, limit), more: posts.length > limit };
	}

	// static async searchCommentByQuery(q: string, page=1, limit = 10): Promise<Comment[]> {
	// 	return await CommentRepository.searchCommentByQuery(q, page, limit);
	// }
}
