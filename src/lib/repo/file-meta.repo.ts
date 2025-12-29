import type { FileMetaCreate, FileMetaDoc, FileId } from '$lib/types/file-meta.type.js';

import { FileMetaModel } from '$lib/models/file-meta.model.js';

export async function createFileMeta(fileMetaCreate: FileMetaCreate): Promise<FileMetaDoc> {
	const fileMeta = (await FileMetaModel.create(fileMetaCreate)).toObject();
	return fileMeta;
}

export async function getFileMetaById(fileId: FileId): Promise<FileMetaDoc | null> {
	const fileMeta = await FileMetaModel.findOne({ _id: fileId }).lean();
	if (fileMeta === null) return null;
	return fileMeta;
}

export async function getFileMetasByFileIds(fileIds: FileId[]): Promise<Array<FileMetaDoc | null>> {
	const fileMetas = await FileMetaModel.find({ _id: { $in: fileIds } }).lean();

	const map = new Map(
		fileMetas.map((fileMeta) => {
			return [fileMeta._id.toString(), fileMeta];
		})
	);

	return fileIds.map((fileId) => map.get(fileId.toString()) ?? null);
}

export async function deleteFileMetaById(fileId: FileId): Promise<boolean> {
	const res = await FileMetaModel.deleteOne({ _id: fileId });
	return res.deletedCount > 0;
}

export async function deleteFileMetasByFileIds(fileIds: FileId[]): Promise<boolean> {
	const res = await FileMetaModel.deleteMany({ _id: { $in: fileIds } });
	return res.deletedCount > 0;
}
