import type { FileMetaCreate, FileMetaDoc, FileId } from '$lib/types/file-meta.type.js';
import type { PostId } from '$lib/types/post.type.js';
import type { PetitionId } from '$lib/types/petition.type.js';

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

export async function getFileMetasByArticleId(articleId: PostId | PetitionId ): Promise<FileMetaDoc[]> {
	const fileMetas = await FileMetaModel.find({ articleIds: articleId }).lean();
	return fileMetas;
}

export async function deleteFileMetaById(fileId: FileId): Promise<boolean> {
	const res = await FileMetaModel.deleteOne({ _id: fileId });
	return res.deletedCount > 0;
}

export async function deleteFileMetasByFileIds(fileIds: FileId[]): Promise<boolean> {
	const res = await FileMetaModel.deleteMany({ _id: { $in: fileIds } });
	return res.deletedCount > 0;
}

export async function addArticleIdToFile(fileId: FileId, articleId: PostId | PetitionId): Promise<FileMetaDoc | null> {
	const updatedFileMeta = await FileMetaModel.findOneAndUpdate(
		{ _id: fileId },
		{ $addToSet: { articleIds: articleId } },
		{ new: true }
	).lean();
	return updatedFileMeta;
}

export async function removeArticleIdFromFile(fileId: FileId, articleId: PostId | PetitionId): Promise<FileMetaDoc | null> {
	const updatedFileMeta = await FileMetaModel.findOneAndUpdate(
		{ _id: fileId },
		{ $pull: { articleIds: articleId } },
		{ new: true }
	).lean();
	return updatedFileMeta;
}

export async function addArticleIdToFiles(fileIds: FileId[], articleId: PostId | PetitionId): Promise<boolean> {
	const res = await FileMetaModel.updateMany(
		{ _id: { $in: fileIds } },
		{ $addToSet: { articleIds: articleId } }
	);
	return res.modifiedCount > 0;
}

export async function removeArticleIdFromFiles(fileIds: FileId[], articleId: PostId | PetitionId): Promise<boolean> {
	const res = await FileMetaModel.updateMany(
		{ _id: { $in: fileIds } },
		{ $pull: { articleIds: articleId } }
	);
	return res.modifiedCount > 0;
}

export async function removeArticleIdFromAllFiles(articleId: PostId | PetitionId): Promise<boolean> {
	const res = await FileMetaModel.updateMany(
		{ articleIds: articleId },
		{ $pull: { articleIds: articleId } }
	);
	return res.modifiedCount > 0;
}

export async function getOrphanedFiles(cutoffTime: Date): Promise<FileMetaDoc[]> {
	const fileMetas = await FileMetaModel.find({
		articleIds: { $size: 0 },
		createdAt: { $lt: cutoffTime }
	}).lean();
	return fileMetas;
}

// export async function deleteOrphanedFiles(cutoffTime: Date): Promise<number> {
// 	const res = await FileMetaModel.deleteMany({
// 		articleIds: { $size: 0 },
// 		createdAt: { $lt: cutoffTime }
// 	});
// 	return res.deletedCount;
// }