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
import GeneralUtils from '$lib/general/utils';
import type { UserId } from '$lib/user/types';

export class PostRepository {
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

	static async likePostById(postId: PostId, userId: UserId): Promise<Post | null> {
		return await PostModel.findOneAndUpdate(
			{ _id: postId, likedBy: { $ne: userId } },
			{ $addToSet: { likedBy: userId }, $inc: { likeCnt: 1 } },
			{ new: true }
		).lean();
	}

	static async unlikePostById(postId: PostId, userId: UserId): Promise<Post | null> {
		return await PostModel.findOneAndUpdate(
			{ _id: postId, likedBy: userId },
			{ $pull: { likedBy: userId }, $inc: { likeCnt: -1 } },
			{ new: true }
		).lean();
	}
}

export class CommentRepository {
	static async createComment(comment: CommentCreate): Promise<Comment> {
		return (await CommentModel.create(comment)).toObject();
	}

	static async getCommentById(commentId: CommentId): Promise<Comment | null> {
		return await CommentModel.findOne({ _id: commentId }).lean();
	}

	static async getCommentsByPostId(postId: PostId): Promise<Comment[]> {
		return await CommentModel.find({ postId }).sort({ createdAt: -1 }).lean();
	}

	static async getCommentsByPostIds(postIds: PostId[]): Promise<Array<Comment[] | null>> {
		const comments = await CommentModel.find({ postId: { $in: postIds } }).lean();

		const commentsById = new Map<string, Comment[]>();
		for (const comment of comments) {
			GeneralUtils.addItemToArrInMap(commentsById, comment.postId.toString(), comment);
		}

		return postIds.map((postId) => commentsById.get(postId.toString()) ?? null);
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
