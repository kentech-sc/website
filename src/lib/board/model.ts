import mongoose from 'mongoose';
import type { Comment, Post } from './type';

const PostSchema = new mongoose.Schema(
	{
		boardId: { type: String, required: true },
		userId: { type: mongoose.Schema.Types.ObjectId, required: true },
		title: { type: String, required: true },
		content: { type: String, required: true }
	},
	{
		timestamps: true
	}
);

const CommentSchema = new mongoose.Schema(
	{
		postId: { type: mongoose.Schema.Types.ObjectId, required: true },
		userId: { type: mongoose.Schema.Types.ObjectId, required: true },
		content: { type: String, required: true }
	},
	{
		timestamps: true
	}
);

export const PostModel = mongoose.model<Post>('Post', PostSchema);
export const CommentModel = mongoose.model<Comment>('Comment', CommentSchema);
