import mongoose from 'mongoose';
import type { CommentDoc } from '$lib/types/comment.type.js';

const CommentSchema = new mongoose.Schema(
	{
		postId: { type: mongoose.Schema.Types.ObjectId, required: true },
		userId: { type: mongoose.Schema.Types.ObjectId, required: true },
		displayType: { type: String, required: true },
		content: { type: String, required: true },
		likedBy: { type: [mongoose.Schema.Types.ObjectId], required: true, default: [] }
	},
	{
		timestamps: true
	}
);

CommentSchema.index({ postId: 1, createdAt: -1 });
CommentSchema.index({ content: 'text' });

export const CommentModel = mongoose.model<CommentDoc>('Comment', CommentSchema);
