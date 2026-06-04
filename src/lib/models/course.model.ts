import mongoose from 'mongoose';
import type { CourseEntity } from '$lib/types/course.type.js';

const CourseSchema = new mongoose.Schema<CourseEntity>({
	_id: { type: String, required: true },
	name: { type: String, required: true },
	content: { type: String, required: true }
});

export const CourseModel = mongoose.model('Course', CourseSchema);
