import mongoose from 'mongoose';
import type { UserDoc } from '$lib/types/user.type.js';

const UserSchema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true },
		realName: { type: String, required: true },
		nickname: { type: String, required: true, unique: true },
		group: { type: String, required: true, enum: ['user', 'moderator', 'manager', 'dev'] },
		blockedUntil: { type: Date, default: null }
	},
	{
		timestamps: true
	}
);

// UserSchema.index({ email: 1 });
UserSchema.index({ realName: 1 });
// UserSchema.index({ nickname: 1 });

export const UserModel = mongoose.model<UserDoc>('User', UserSchema);
