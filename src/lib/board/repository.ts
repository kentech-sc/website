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
import { paginateModel } from '$lib/general/paginate';
import type { UserId } from '$lib/user/types';

export class PostRepository {
	static async createPost(postCreate: PostCreate): Promise<Post> {
		return (await PostModel.create(postCreate)).toObject();
	}

	static async getPostById(postId: PostId): Promise<Post | null> {
		return await PostModel.findOne({ _id: postId }).lean();
	}

	static async getPostsByBoardId(
		boardId: BoardId,
		limit = 10,
		{ fromId, toId }: { fromId?: PostId; toId?: PostId } = {}
	): Promise<{ pageItems: Post[]; fromId?: PostId; toId?: PostId }> {
		return await paginateModel(PostModel, { boardId }, limit, { fromId, toId });
	}

	static async updatePostById(postId: PostId, postUpdate: PostUpdate): Promise<Post | null> {
		return await PostModel.findOneAndUpdate({ _id: postId }, postUpdate, { new: true }).lean();
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

	static async searchPostByQuery(q: string, page = 1, limit = 10): Promise<Post[]> {
		const results = await PostModel.find(
			{ $text: { $search: q } },
			{ searchScore: { $meta: 'textScore' } }
		)
			.sort({ searchScore: { $meta: 'textScore' }, createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit + 1)
			.lean();
		return results;
	}
}

export class CommentRepository {
	static async createComment(commentCreate: CommentCreate): Promise<Comment> {
		await PostRepository.updatePostById(commentCreate.postId, { $inc: { commentCnt: 1 } });
		return (await CommentModel.create(commentCreate)).toObject();
	}

	static async getCommentById(commentId: CommentId): Promise<Comment | null> {
		return await CommentModel.findOne({ _id: commentId }).lean();
	}

	static async getAllCommentsByPostId(postId: PostId): Promise<Comment[]> {
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
		commentUpdate: CommentUpdate
	): Promise<Comment | null> {
		return await CommentModel.findOneAndUpdate({ _id: commentId }, commentUpdate, {
			new: true
		}).lean();
	}

	static async deleteCommentById(commentId: CommentId): Promise<Comment | null> {
		const comment = await CommentModel.findOneAndDelete({ _id: commentId }).lean();
		if (!comment) return null;
		await PostRepository.updatePostById(comment.postId, { $inc: { commentCnt: -1 } });
		return comment;
	}

	static async deleteAllCommentsByPostId(postId: PostId): Promise<void> {
		await CommentModel.deleteMany({ postId });
	}

	static async searchCommentByQuery(q: string, page = 1, limit = 10): Promise<Comment[]> {
		const results = await CommentModel.find(
			{ $text: { $search: q } },
			{ searchScore: { $meta: 'textScore' } }
		)
			.sort({ searchScore: { $meta: 'textScore' } })
			.skip((page - 1) * limit)
			.limit(limit + 1)
			.lean();
		return results;
	}
}
