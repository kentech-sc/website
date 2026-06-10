import type { FileMetaCreate, FileMetaEntity, FileId } from '$lib/types/file-meta.type.js';
import type { PetitionId } from '$lib/types/petition.type.js';
import type { PostId } from '$lib/types/post.type.js';

import { FileMetaModel } from '$lib/models/file-meta.model.js';
import { toPojo } from '$lib/shared/utils.js';

export async function createFileMeta(fileMetaCreate: FileMetaCreate): Promise<FileMetaEntity> {
	const fileMeta = (await FileMetaModel.create(fileMetaCreate)).toObject();
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

export async function findFilePresenceEntriesByArticleIds(
	articleIds: Array<PostId | PetitionId>
): Promise<Array<Pick<FileMetaEntity, 'articleIds' | 'mime'>>> {
	const fileMetas = await FileMetaModel.find(
		{ articleIds: { $in: articleIds } },
		{ _id: 0, articleIds: 1, mime: 1 }
	).lean();
	return toPojo<Array<Pick<FileMetaEntity, 'articleIds' | 'mime'>>>(fileMetas);
}

export async function deleteFileMetasByFileIds(fileIds: FileId[]): Promise<boolean> {
	const res = await FileMetaModel.deleteMany({ _id: { $in: fileIds } });
	return res.deletedCount > 0;
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
