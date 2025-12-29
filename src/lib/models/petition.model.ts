import mongoose from 'mongoose';
import { PetitionStatus, type PetitionDoc } from '$lib/types/petition.type.js';

const PetitionSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		content: { type: String, required: true },
		status: { type: String, default: PetitionStatus.Ongoing },
		viewCnt: { type: Number, default: 0 },
		signedBy: { type: [mongoose.Schema.Types.ObjectId], default: [] },
		files: { type: [mongoose.Schema.Types.ObjectId], default: [] },
		petitionerId: { type: mongoose.Schema.Types.ObjectId, required: true },
		responderId: { type: mongoose.Schema.Types.ObjectId, default: null },
		response: { type: String, default: null },
		answeredAt: { type: Date, default: null }
	},
	{
		timestamps: true
	}
);

PetitionSchema.index({ title: 'text', content: 'text', response: 'text' });

export const PetitionModel = mongoose.model<PetitionDoc>('Petition', PetitionSchema);
