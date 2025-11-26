import mongoose from 'mongoose';
import type { Professor } from '$lib/types/prof.type.js';

const ProfessorSchema = new mongoose.Schema({
	name: { type: String, required: true, unique: true }
});

export default mongoose.model<Professor>('Professor', ProfessorSchema);
