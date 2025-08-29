import mongoose from 'mongoose';
import type { Review } from './types.js';

const ReviewSchema = new mongoose.Schema<Review>(
	{
		courseId: { type: mongoose.Schema.Types.ObjectId, required: true },
		professorId: { type: mongoose.Schema.Types.ObjectId, required: true },
		userId: { type: mongoose.Schema.Types.ObjectId, required: true },
		score: { type: Number, required: true },
		comment: { type: String, default: '' }
	},
	{
		timestamps: true
	}
);

export default mongoose.model<Review>('Review', ReviewSchema);
