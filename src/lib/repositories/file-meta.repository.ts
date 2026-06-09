import type { FileMetaCreate, FileMetaEntity, FileId } from '$lib/types/file-meta.type.js';
import type { PostId } from '$lib/types/post.type.js';
import type { PetitionId } from '$lib/types/petition.type.js';

import { FileMetaModel } from '$lib/models/file-meta.model.js';
import { toPojo } from '$lib/shared/utils.js';

export async function createFileMeta(fileMetaCreate: FileMetaCreate): Promise<FileMetaEntity> {
	const fileMeta = (await FileMetaModel.create(fileMetaCreate)).toObject();
	return toPojo<FileMetaEntity>(fileMeta);
}

export async function findFileMetaById(fileId: FileId): Promise<FileMetaEntity | null> {
	const fileMeta = await FileMetaModel.findOne({ _id: fileId }).lean();
	if (fileMeta === null) return null;
	return toPojo<FileMetaEntity>(fileMeta);
}

export async function findFileMetasByFileIds(
	fileIds: FileId[]
): Promise<Array<FileMetaEntity | null>> {
	const fileMetas = await FileMetaModel.find({ _id: { $in: fileIds } }).lean();

	const fileIdToFileMeta = new Map(
		fileMetas.map((fileMeta) => {
			return [fileMeta._id.toString(), fileMeta];
		})
	);

	return toPojo<Array<FileMetaEntity | null>>(
		fileIds.map((fileId) => fileIdToFileMeta.get(fileId.toString()) ?? null)
	);
}

export async function findFileMetasByArticleId(
	articleId: PostId | PetitionId
): Promise<FileMetaEntity[]> {
	const fileMetas = await FileMetaModel.find({ articleIds: articleId }).lean();
	return toPojo<FileMetaEntity[]>(fileMetas);
}

export async function deleteFileMetaById(fileId: FileId): Promise<boolean> {
	const res = await FileMetaModel.deleteOne({ _id: fileId });
	return res.deletedCount > 0;
}

export async function deleteFileMetasByFileIds(fileIds: FileId[]): Promise<boolean> {
	const res = await FileMetaModel.deleteMany({ _id: { $in: fileIds } });
	return res.deletedCount > 0;
}

export async function addArticleIdToFile(
	fileId: FileId,
	articleId: PostId | PetitionId
): Promise<FileMetaEntity | null> {
	const updatedFileMeta = await FileMetaModel.findOneAndUpdate(
		{ _id: fileId },
		{ $addToSet: { articleIds: articleId } },
		{ returnDocument: 'after' }
	).lean();
	return toPojo<FileMetaEntity | null>(updatedFileMeta);
}

export async function removeArticleIdFromFile(
	fileId: FileId,
	articleId: PostId | PetitionId
): Promise<FileMetaEntity | null> {
	const updatedFileMeta = await FileMetaModel.findOneAndUpdate(
		{ _id: fileId },
		{ $pull: { articleIds: articleId } },
		{ returnDocument: 'after' }
	).lean();
	return toPojo<FileMetaEntity | null>(updatedFileMeta);
}

export async function addArticleIdToFiles(
	fileIds: FileId[],
	articleId: PostId | PetitionId
): Promise<boolean> {
	const res = await FileMetaModel.updateMany(
		{ _id: { $in: fileIds } },
		{ $addToSet: { articleIds: articleId } }
	);
	return res.modifiedCount > 0;
}

export async function removeArticleIdFromFiles(
	fileIds: FileId[],
	articleId: PostId | PetitionId
): Promise<boolean> {
	const res = await FileMetaModel.updateMany(
		{ _id: { $in: fileIds } },
		{ $pull: { articleIds: articleId } }
	);
	return res.modifiedCount > 0;
}

export async function removeArticleIdFromAllFiles(
	articleId: PostId | PetitionId
): Promise<boolean> {
	const res = await FileMetaModel.updateMany(
		{ articleIds: articleId },
		{ $pull: { articleIds: articleId } }
	);
	return res.modifiedCount > 0;
}

export async function findOrphanedFiles(cutoffTime: Date): Promise<FileMetaEntity[]> {
	const fileMetas = await FileMetaModel.find({
		articleIds: { $size: 0 },
		createdAt: { $lt: cutoffTime }
	}).lean();
	return toPojo<FileMetaEntity[]>(fileMetas);
}

// export async function deleteOrphanedFiles(cutoffTime: Date): Promise<number> {
// 	const res = await FileMetaModel.deleteMany({
// 		articleIds: { $size: 0 },
// 		createdAt: { $lt: cutoffTime }
// 	});
// 	return res.deletedCount;
// }

export async function convertArticleIdsToStringInFileMetas() {
	const fileMetas = await FileMetaModel.find().lean();

	await Promise.all(
		fileMetas.map(async (fileMeta) => {
			const articleIdsAsString = fileMeta.articleIds.map((id) => id.toString());
			await FileMetaModel.updateOne(
				{ _id: fileMeta._id },
				{ $set: { articleIds: articleIdsAsString } }
			);
		})
	);
}