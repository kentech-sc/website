import mongoose from 'mongoose';
import type { Comment } from '$lib/types/comment.type';

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

CommentSchema.index({ likedBy: 1 });
CommentSchema.index({ content: 'text' });

export const CommentModel = mongoose.model<Comment>('Comment', CommentSchema);
