import mongoose from 'mongoose';

import type { CommentEntity } from '$lib/types/comment.type.js';

const CommentSchema = new mongoose.Schema<CommentEntity>(
	{
		postId: { type: String, required: true },
		userId: { type: String, required: true },
		displayType: { type: String, required: true },
		content: { type: String, required: true }
	},
	{
		timestamps: true
	}
);

CommentSchema.index({ postId: 1, createdAt: -1 });
CommentSchema.index({ content: 'text' });

export const CommentModel = mongoose.model('Comment', CommentSchema);
