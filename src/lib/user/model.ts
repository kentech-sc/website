import mongoose from 'mongoose';
import type { User } from './types';

const schema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true },
		realName: { type: String, required: true },
		nickname: { type: String, required: true },
		group: { type: String, required: true }
	},
	{
		timestamps: true
	}
);

export default mongoose.model<User>('User', schema);
