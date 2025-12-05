import mongoose from 'mongoose';
import type { FileMeta } from '$lib/types/file-meta.type.js';

const FileMetaSchema = new mongoose.Schema(
	{
		key: { type: String, required: true },
		name: { type: String, required: true },
		size: { type: Number, required: true },
		mime: { type: String, required: true },
		ext: { type: String, required: true }
	},
	{
		timestamps: true
	}
);

FileMetaSchema.index({ key: 1 });

export const FileMetaModel = mongoose.model<FileMeta>('FileMeta', FileMetaSchema);
