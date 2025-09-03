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
			displayType
		};
		return await PostRepository.createPost(post);
	}

	static async updatePostById(postId: PostId, post: PostUpdate): Promise<void> {
		await PostRepository.updatePostById(postId, post);
	}

	static async deletePostById(postId: PostId, user: User): Promise<void> {
		return await mongoose.connection.transaction(async () => {
			const post = await this.getPostById(postId);
			if (user._id.toString() !== post.userId.toString())
				throw new Error('이 게시글을 삭제할 수 없습니다.');
			await PostRepository.deletePostById(postId);
			await CommentRepository.deleteAllCommentsByPostId(postId);
		});
	}

	static async viewPostById(postId: PostId): Promise<void> {
		await PostRepository.updatePostById(postId, { $inc: { viewCnt: 1 } });
	}

	static async likePostById(postId: PostId, userId: UserId): Promise<Post | null> {
		// if (post.likedBy.some((id) => id.equals(userId)))
		// 	throw new Error('이미 좋아요를 눌렀습니다.');
		return await PostRepository.likePostById(postId, userId);
	}

	static async unlikePostById(postId: PostId, userId: UserId): Promise<Post | null> {
		// if (!post.likedBy.some((id) => id.equals(userId)))
		// 	throw new Error('아직 좋아요를 누르지 않았습니다.');
		return await PostRepository.unlikePostById(postId, userId);
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

	static async updateCommentById(commentId: CommentId, comment: CommentUpdate): Promise<Comment> {
		const updatedComment = await CommentRepository.updateCommentById(commentId, comment);
		if (!updatedComment) throw new Error('존재하지 않는 댓글입니다.');
		return updatedComment;
	}

	static async deleteCommentById(commentId: CommentId, user: User): Promise<void> {
		return await mongoose.connection.transaction(async () => {
			const comment = await this.getCommentById(commentId);
			if (user._id.toString() !== comment.userId.toString())
				throw new Error('이 댓글을 삭제할 수 없습니다.');
			await CommentRepository.deleteCommentById(commentId);
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
