import type { FileMetaCreate, FileMeta, FileId } from '$lib/types/file-meta.type.js';

import { FileMetaModel } from '$lib/models/file-meta.model.js';

export async function createFileMeta(fileMetaCreate: FileMetaCreate): Promise<FileMeta> {
	return (await FileMetaModel.create(fileMetaCreate)).toObject();
}

export async function getFileMetaById(fileId: FileId): Promise<FileMeta | null> {
	return await FileMetaModel.findOne({ _id: fileId }).lean();
}

export async function getFileMetasByFileIds(fileIds: FileId[]): Promise<Array<FileMeta | null>> {
	const fileMetas = await FileMetaModel.find({ _id: { $in: fileIds } }).lean();

	const fileMetasById = new Map<string, FileMeta>();
	for (const fileMeta of fileMetas) {
		fileMetasById.set(fileMeta._id.toString(), fileMeta);
	}

	return fileIds.map((fileId) => fileMetasById.get(fileId.toString()) ?? null);
}

export async function deleteFileMetaById(fileId: FileId): Promise<FileMeta | null> {
	return await FileMetaModel.findOneAndDelete({ _id: fileId }).lean();
}

export async function deleteFileMetasByFileIds(fileIds: FileId[]): Promise<void> {
	await FileMetaModel.deleteMany({ _id: { $in: fileIds } });
}
