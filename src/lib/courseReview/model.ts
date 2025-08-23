import mongoose from 'mongoose';
import type { Course, Review } from './type.js';

const CourseSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		content: { type: String, required: true },
		professor: { type: String, required: true },
		totalScore: { type: Number, required: true, default: 0 },
		reviewCnt: { type: Number, required: true, default: 0 }
	},
	{
		timestamps: true
	}
);

const ReviewSchema = new mongoose.Schema<Review>(
	{
		courseId: { type: String, required: true },
		userId: { type: String, required: true },
		score: { type: Number, required: true },
		comment: { type: String, default: '' }
	},
	{
		timestamps: true
	}
);

export const CourseModel = mongoose.model<Course>('Course', CourseSchema);
export const ReviewModel = mongoose.model<Review>('Review', ReviewSchema);
