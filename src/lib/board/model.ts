import mongoose from 'mongoose';
import type { Comment, Post } from './types';

const PostSchema = new mongoose.Schema(
	{
		boardId: { type: String, required: true },
		userId: { type: mongoose.Schema.Types.ObjectId, required: true },
		displayType: { type: String, required: true },
		title: { type: String, required: true },
		content: { type: String, required: true },
		viewCnt: { type: Number, required: true, default: 0 },
		likeCnt: { type: Number, required: true, default: 0 },
		commentCnt: { type: Number, required: true, default: 0 },
		likedBy: { type: [mongoose.Schema.Types.ObjectId], required: true, default: [] }
	},
	{
		timestamps: true
	}
);

const CommentSchema = new mongoose.Schema(
	{
		postId: { type: mongoose.Schema.Types.ObjectId, required: true },
		userId: { type: mongoose.Schema.Types.ObjectId, required: true },
		displayType: { type: String, required: true },
		content: { type: String, required: true },
		likeCnt: { type: Number, required: true, default: 0 },
		likedBy: { type: [mongoose.Schema.Types.ObjectId], required: true, default: [] }
	},
	{
		timestamps: true
	}
);

PostSchema.index({ likedBy: 1 });
CommentSchema.index({ likedBy: 1 });

export const PostModel = mongoose.model<Post>('Post', PostSchema);
export const CommentModel = mongoose.model<Comment>('Comment', CommentSchema);
