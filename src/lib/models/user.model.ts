import mongoose from 'mongoose';
import type { User } from '$lib/types/user.type.js';

const schema = new mongoose.Schema(
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

export default mongoose.model<User>('User', schema);
