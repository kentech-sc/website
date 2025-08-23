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
} from './type';
import { CommentModel, PostModel } from './model';

export class PostController {
	static async setPost(post: PostCreate): Promise<Post> {
		return (await PostModel.create(post)).toObject();
	}

	static async getPostByPostId(postId: PostId): Promise<Post> {
		return await PostModel.findOne({ _id: postId }).lean();
	}

	static async getPostsByBoardId(boardId: BoardId): Promise<Post[]> {
		return await PostModel.find({ boardId }).sort({ createdAt: -1 }).lean();
	}

	static async updatePostByPostId(postId: PostId, post: PostUpdate): Promise<void> {
		await PostModel.updateOne({ _id: postId }, post);
	}

	static async deletePostByPostId(postId: PostId): Promise<void> {
		await PostModel.deleteOne({ _id: postId });
	}

	static async deleteAllPostsByBoardId(boardId: BoardId): Promise<void> {
		await PostModel.deleteMany({ boardId });
	}
}

export class CommentController {
	static async setComment(comment: CommentCreate): Promise<Comment> {
		return (await CommentModel.create(comment)).toObject();
	}

	static async getCommentByCommentId(commentId: CommentId): Promise<Comment> {
		return await CommentModel.findOne({ _id: commentId }).lean();
	}

	static async getCommentsByPostId(postId: PostId): Promise<Comment[]> {
		return await CommentModel.find({ postId }).sort({ createdAt: -1 }).lean();
	}

	static async updateCommentByCommentId(
		commentId: CommentId,
		comment: CommentUpdate
	): Promise<void> {
		await CommentModel.updateOne({ _id: commentId }, comment);
	}

	static async deleteCommentByCommentId(commentId: CommentId): Promise<void> {
		await CommentModel.deleteOne({ _id: commentId });
	}

	static async deleteAllCommentsByPostId(postId: PostId): Promise<void> {
		await CommentModel.deleteMany({ postId });
	}
}
