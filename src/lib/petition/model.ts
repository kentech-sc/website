import mongoose from 'mongoose';
import type { Petition } from './types';

const PetitionSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		content: { type: String, required: true },
		viewCnt: { type: Number, default: 0 },
		signCnt: { type: Number, default: 0 },
		signedBy: { type: [mongoose.Schema.Types.ObjectId], default: [] },
		petitionerId: { type: mongoose.Schema.Types.ObjectId, required: true },
		responderId: { type: mongoose.Schema.Types.ObjectId, default: null },
		response: { type: String, default: null },
		answeredAt: { type: Date, default: null },
		status: { type: String, required: true }
	},
	{
		timestamps: true
	}
);

PetitionSchema.index({ signedBy: 1 });
PetitionSchema.index({ title: 'text', content: 'text', response: 'text' });

export const PetitionModel = mongoose.model<Petition>('Petition', PetitionSchema);
