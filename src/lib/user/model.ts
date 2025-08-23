import mongoose from 'mongoose';
import type { User } from './type';

const schema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true },
		name: { type: String, required: true, unique: true },
		group: { type: String, required: true }
	},
	{
		timestamps: true
	}
);

export default mongoose.model<User>('User', schema);
