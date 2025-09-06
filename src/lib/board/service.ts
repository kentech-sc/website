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
import { PostRepository, CommentRepository } from './repository';
import type { User, UserId, DisplayType } from '$lib/user/types';
import mongoose from 'mongoose';

export default class BoardService {
	static async getPostById(postId: PostId): Promise<Post> {
		const post = await PostRepository.getPostById(postId);
		if (!post) throw new Error('존재하지 않는 게시글입니다.');
		return post;
	}

	static async getPostsByBoardId(boardId: BoardId): Promise<Post[]> {
		const posts = await PostRepository.getPostsByBoardId(boardId);
		return posts;
	}

	static async getCommentById(commentId: CommentId): Promise<Comment> {
		const comment = await CommentRepository.getCommentById(commentId);
		if (!comment) throw new Error('존재하지 않는 댓글입니다.');
		return comment;
	}

	static async getCommentsByPostId(postId: PostId): Promise<Comment[]> {
		const comments = await CommentRepository.getCommentsByPostId(postId);
		if (!comments) throw new Error('댓글이 존재하지 않습니다.');
		return comments;
	}

	// static async getCommentsByPostIds(postIds: PostId[]): Promise<Array<Comment[] | null>> {
	// 	return await CommentRepository.getCommentsByPostIds(postIds);
	// }

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
			commentCnt: 0,
			displayType
		};
		return await PostRepository.createPost(post);
	}

	static async editPostById(postId: PostId, post: PostUpdate, user: User): Promise<Post> {
		const updatedPost = await PostRepository.editPostById(postId, post, user._id);
		if (!updatedPost) throw new Error('존재하지 않는 게시글이거나, 작성자가 아닙니다.');
		return updatedPost;
	}

	static async deletePostById(postId: PostId, user: User): Promise<void> {
		return await mongoose.connection.transaction(async () => {
			const deletedPost = await PostRepository.deletePostById(postId, user._id);
			if (!deletedPost) throw new Error('존재하지 않는 게시글이거나, 작성자가 아닙니다.');
			await CommentRepository.deleteAllCommentsByPostId(postId);
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

	static async editCommentById(
		commentId: CommentId,
		comment: CommentUpdate,
		user: User
	): Promise<Comment> {
		const updatedComment = await CommentRepository.editCommentById(commentId, comment, user._id);
		if (!updatedComment) throw new Error('존재하지 않는 댓글이거나, 작성자가 아닙니다.');
		return updatedComment;
	}

	static async deleteCommentById(commentId: CommentId, user: User): Promise<void> {
		return await mongoose.connection.transaction(async () => {
			const deletedComment = await CommentRepository.deleteCommentById(commentId, user._id);
			if (deletedComment === null) throw new Error('존재하지 않는 댓글이거나, 작성자가 아닙니다.');
		});
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
}
