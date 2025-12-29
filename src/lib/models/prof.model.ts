import mongoose from 'mongoose';
import type { ProfessorDoc } from '$lib/types/prof.type.js';

const ProfessorSchema = new mongoose.Schema({
	name: { type: String, required: true, unique: true }
});

export const ProfessorModel = mongoose.model<ProfessorDoc>('Professor', ProfessorSchema);
