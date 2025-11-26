import mongoose from 'mongoose';
import type { Course } from '$lib/types/course.type.js';

const CourseSchema = new mongoose.Schema({
	code: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	content: { type: String, required: true }
});

export default mongoose.model<Course>('Course', CourseSchema);
