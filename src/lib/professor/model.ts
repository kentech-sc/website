import mongoose from 'mongoose';
import type { Professor } from './types.js';

const ProfessorSchema = new mongoose.Schema({
	name: { type: String, required: true }
});

export default mongoose.model<Professor>('Professor', ProfessorSchema);
