import mongoose from 'mongoose';

import type { ActivityLog } from '$lib/types/activity-log.type.js';

const ActivityLogSchema = new mongoose.Schema<ActivityLog>(
	{
		actorId: { type: String, required: true },
		action: { type: String, required: true, enum: ['create', 'edit', 'delete'] },
		targetType: {
			type: String,
			required: true,
			enum: ['post', 'comment', 'review', 'petition', 'petition-response']
		},
		targetId: { type: String, required: true },
		parentTargetId: { type: String, default: null },
		cause: {
			type: String,
			required: true,
			enum: ['direct', 'post-delete-cascade']
		},
		beforeSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
		afterSnapshot: { type: mongoose.Schema.Types.Mixed, default: null }
	},
	{
		timestamps: { createdAt: true, updatedAt: false }
	}
);

export const ActivityLogModel = mongoose.model('ActivityLog', ActivityLogSchema);
