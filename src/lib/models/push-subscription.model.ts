import mongoose from 'mongoose';

import type { PushSubscriptionEntity } from '$lib/types/push-subscription.type.js';

const PushSubscriptionSchema = new mongoose.Schema<PushSubscriptionEntity>(
	{
		userId: { type: String, required: true, index: true },
		endpoint: { type: String, required: true },
		expirationTime: { type: Number, default: null },
		keys: {
			p256dh: { type: String, required: true },
			auth: { type: String, required: true }
		},
		userAgent: { type: String, default: '' }
	},
	{
		timestamps: true
	}
);

PushSubscriptionSchema.index({ userId: 1, endpoint: 1 }, { unique: true });

export const PushSubscriptionModel = mongoose.model(
	'PushSubscription',
	PushSubscriptionSchema
);
