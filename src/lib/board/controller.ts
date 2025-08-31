import type {
	BoardId,
	PostId,
	PostCreate,
	PostUpdate,
	Comment,
	CommentId,
	CommentCreate,
	CommentUpdate,
	Post
} from './types';
import { CommentModel, PostModel } from './model';

export class PostController {
	static async createPost(post: PostCreate): Promise<Post> {
		return (await PostModel.create(post)).toObject();
	}

	static async getPostById(postId: PostId): Promise<Post | null> {
		return await PostModel.findOne({ _id: postId }).lean();
	}

	static async getPostsByBoardId(boardId: BoardId): Promise<Post[]> {
		return await PostModel.find({ boardId }).sort({ createdAt: -1 }).lean();
	}

	static async updatePostById(postId: PostId, post: PostUpdate): Promise<Post | null> {
		return await PostModel.findOneAndUpdate({ _id: postId }, post, { new: true }).lean();
	}

	static async deletePostById(postId: PostId): Promise<Post | null> {
		return await PostModel.findOneAndDelete({ _id: postId }).lean();
	}

	static async deleteAllPostsByBoardId(boardId: BoardId): Promise<void> {
		await PostModel.deleteMany({ boardId }).lean();
	}
}

export class CommentController {
	static async createComment(comment: CommentCreate): Promise<Comment> {
		return (await CommentModel.create(comment)).toObject();
	}

	static async getCommentById(commentId: CommentId): Promise<Comment | null> {
		return await CommentModel.findOne({ _id: commentId }).lean();
	}

	static async getCommentsByPostId(postId: PostId): Promise<Comment[]> {
		return await CommentModel.find({ postId }).sort({ createdAt: -1 }).lean();
	}

	static async updateCommentById(
		commentId: CommentId,
		comment: CommentUpdate
	): Promise<Comment | null> {
		return await CommentModel.findOneAndUpdate({ _id: commentId }, comment, { new: true }).lean();
	}

	static async deleteCommentById(commentId: CommentId): Promise<Comment | null> {
		return await CommentModel.findOneAndDelete({ _id: commentId }).lean();
	}

	static async deleteAllCommentsByPostId(postId: PostId): Promise<void> {
		await CommentModel.deleteMany({ postId });
	}
}
