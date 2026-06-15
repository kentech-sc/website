import mongoose from 'mongoose';

import type { Throttle } from '$lib/types/throttle.type.js';

const ThrottleSchema = new mongoose.Schema<Throttle>(
	{
		userId: { type: String, required: true },
		bucket: { type: String, required: true },
		availableAt: { type: String, required: true }
	},
	{
		timestamps: true
	}
);

ThrottleSchema.index({ userId: 1, bucket: 1 }, { unique: true });

export const ThrottleModel = mongoose.model('Throttle', ThrottleSchema);
