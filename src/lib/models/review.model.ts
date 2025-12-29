import mongoose from 'mongoose';
import type { ReviewDoc } from '$lib/types/review.type.js';

const ReviewSchema = new mongoose.Schema<ReviewDoc>(
	{
		courseId: { type: mongoose.Schema.Types.ObjectId, required: true },
		professorId: { type: mongoose.Schema.Types.ObjectId, required: true },
		userId: { type: mongoose.Schema.Types.ObjectId, required: true },
		year: { type: Number, required: true },
		term: { type: Number, required: true },
		title: { type: String, required: true },
		score: {
			assignment: { type: Number, required: true },
			lecture: { type: Number, required: true },
			exam: { type: Number, required: true }
		},
		comment: { type: String, default: '' }
	},
	{
		timestamps: true
	}
);

ReviewSchema.index({ title: 'text', comment: 'text' });

export const ReviewModel = mongoose.model<ReviewDoc>('Review', ReviewSchema);
