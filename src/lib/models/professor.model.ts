import mongoose from 'mongoose';

import type { ProfessorEntity } from '$lib/types/professor.type.js';

const ProfessorSchema = new mongoose.Schema<ProfessorEntity>({
	name: { type: String, required: true, unique: true }
});

export const ProfessorModel = mongoose.model('Professor', ProfessorSchema);
