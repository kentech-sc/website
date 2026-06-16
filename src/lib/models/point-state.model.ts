import mongoose from 'mongoose';

import { PointCapKind, type PointStateEntity } from '$lib/types/point-state.type.js';

const PointStateSchema = new mongoose.Schema<PointStateEntity>(
	{
		userId: { type: String, required: true },
		dateKey: { type: String, required: true },
		counts: {
			[PointCapKind.POST]: { type: Number, required: true, default: 0 },
			[PointCapKind.COMMENT]: { type: Number, required: true, default: 0 },
			[PointCapKind.REVIEW]: { type: Number, required: true, default: 0 },
			[PointCapKind.PETITION]: { type: Number, required: true, default: 0 }
		}
	},
	{
		timestamps: true
	}
);

PointStateSchema.index({ userId: 1 }, { unique: true });

export const PointStateModel = mongoose.model('PointState', PointStateSchema);
