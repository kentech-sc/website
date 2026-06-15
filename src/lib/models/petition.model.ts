import mongoose from 'mongoose';

import { PetitionStatus, type PetitionEntity } from '$lib/types/petition.type.js';

const PetitionSchema = new mongoose.Schema<PetitionEntity>(
	{
		title: { type: String, required: true },
		content: { type: String, required: true },
		status: { type: String, default: PetitionStatus.Ongoing, enum: Object.values(PetitionStatus) },
		viewCnt: { type: Number, default: 0 },
		signedBy: { type: [String], default: [] },
		petitionerId: { type: String, required: true },
		responderId: { type: String, default: null },
		response: { type: String, default: null },
		answeredAt: { type: Date, default: null }
	},
	{
		timestamps: true
	}
);

PetitionSchema.index({ title: 'text', content: 'text', response: 'text' });

export const PetitionModel = mongoose.model('Petition', PetitionSchema);
