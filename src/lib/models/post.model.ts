import mongoose from 'mongoose';
import type { PostDoc } from '$lib/types/post.type.js';

const PostSchema = new mongoose.Schema(
	{
		boardId: { type: String, required: true },
		userId: { type: String, required: true },
		displayType: { type: String, required: true },
		title: { type: String, required: true },
		content: { type: String, required: true },
		viewCnt: { type: Number, required: true, default: 0 },
		commentCnt: { type: Number, required: true, default: 0 },
		likedBy: { type: [String], required: true, default: [] }
	},
	{
		timestamps: true
	}
);

PostSchema.index({ title: 'text', content: 'text' });

export const PostModel = mongoose.model<PostDoc>('Post', PostSchema);
