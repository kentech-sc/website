import mongoose from 'mongoose';
import type { Course, Professor } from './types.js';

const CourseSchema = new mongoose.Schema({
	code: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	content: { type: String, required: true }
});

const ProfessorSchema = new mongoose.Schema({
	name: { type: String, required: true }
});

export const CourseModel = mongoose.model<Course>('Course', CourseSchema);
export const ProfessorModel = mongoose.model<Professor>('Professor', ProfessorSchema);
