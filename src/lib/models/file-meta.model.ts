import mongoose from 'mongoose';

import type { FileMetaEntity } from '$lib/types/file-meta.type.js';

const FileMetaSchema = new mongoose.Schema<FileMetaEntity>(
	{
		key: { type: String, required: true },
		name: { type: String, required: true },
		size: { type: Number, required: true },
		mime: { type: String, required: true },
		ext: { type: String, required: true },
		articleIds: { type: [String], default: [] }
	},
	{
		timestamps: true
	}
);

// FileMetaSchema.index({ key: 1 });
FileMetaSchema.index({ articleIds: 1 });

export const FileMetaModel = mongoose.model('FileMeta', FileMetaSchema);
