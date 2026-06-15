import mongoose from 'mongoose';

import { UserGroup, type UserEntity } from '$lib/types/user.type.js';

const UserSchema = new mongoose.Schema<UserEntity>(
	{
		_id: { type: String, required: true },
		email: { type: String, required: true },
		realName: { type: String, required: true },
		nickname: { type: String, required: true, unique: true },
		group: { type: String, required: true, enum: Object.values(UserGroup) },
		blockedUntil: { type: Date, default: null },
		deletedAt: { type: Date, default: null },
		points: { type: Number, default: 0 }
	},
	{
		timestamps: true
	}
);

// UserSchema.index({ email: 1 });
UserSchema.index({ realName: 1 });
// UserSchema.index({ nickname: 1 });

export const UserModel = mongoose.model('User', UserSchema);
