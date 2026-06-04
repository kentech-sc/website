import mongoose from 'mongoose';
import type { ReviewEntity } from '$lib/types/review.type.js';

const ReviewSchema = new mongoose.Schema<ReviewEntity>(
	{
		courseId: { type: String, required: true },
		professorId: { type: String, required: true },
		userId: { type: String, required: true },
		year: { type: Number, required: true },
		term: { type: Number, required: true },
		title: { type: String, required: true },
		score: {
			assignment: { type: Number, required: true },
			lecture: { type: Number, required: true },
			exam: { type: Number, required: true },
			satisfaction: { type: Number, required: true }
		},
		comment: { type: String, default: '' }
	},
	{
		timestamps: true
	}
);

ReviewSchema.index({ title: 'text', comment: 'text' });

export const ReviewModel = mongoose.model('Review', ReviewSchema);
