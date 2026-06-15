import type {
	FileId,
	FileMeta,
	FileMetaCreate,
	FileMetaEntity
} from '$lib/types/file-meta.type.js';
import type { FilePresence } from '$lib/types/general.type.js';
import type { PetitionId } from '$lib/types/petition.type.js';
import type { PostId } from '$lib/types/post.type.js';
import type { User } from '$lib/types/user.type.js';

import * as FileMetaRepository from '$lib/repositories/file-meta.repository.js';
import * as FileMetaRule from '$lib/rules/file-meta.rule.js';
import { assertRule } from '$lib/server/errors.js';
import { FileStorage } from '$lib/server/storage.js';

function toFileMeta(fileMetaEntity: FileMetaEntity): FileMeta {
	const path = FileStorage.getUrl(fileMetaEntity.key);
	return {
		...fileMetaEntity,
		path
	};
}

export async function findFileMetasByIds(fileIds: FileId[]): Promise<Array<FileMeta | null>> {
	const fileMetas = await FileMetaRepository.findFileMetasByFileIds(fileIds);
	return fileMetas.map((fileMeta) => (fileMeta ? toFileMeta(fileMeta) : null));
}

export async function getFileMetasByArticleId(articleId: PostId | PetitionId): Promise<FileMeta[]> {
	const fileMetas = await FileMetaRepository.findFileMetasByArticleId(articleId);
	return fileMetas.map((fileMeta) => toFileMeta(fileMeta));
}

export async function getFilePresenceByArticleIds(
	articleIds: Array<PostId | PetitionId>
): Promise<FilePresence> {
	const uniqueArticleIds = Array.from(new Set(articleIds.map((articleId) => articleId.toString())));
	if (uniqueArticleIds.length === 0) return {};

	const filePresence = Object.fromEntries(
		uniqueArticleIds.map((articleId) => [articleId, { hasImage: false, hasFile: false }])
	) as FilePresence;

	const fileMetas = await FileMetaRepository.findFilePresenceEntriesByArticleIds(uniqueArticleIds);
	const articleIdSet = new Set(uniqueArticleIds);

	for (const fileMeta of fileMetas) {
		const isImage = fileMeta.mime.startsWith('image/');

		for (const articleId of fileMeta.articleIds) {
			const key = articleId.toString();
			if (!articleIdSet.has(key)) continue;

			if (isImage) filePresence[key].hasImage = true;
			else filePresence[key].hasFile = true;
		}
	}

	return filePresence;
}

export async function uploadFile(file: File): Promise<FileMeta> {
	const uploadResult = await FileStorage.upload(file);
	const fileMetaCreate: FileMetaCreate = {
		key: uploadResult.key,
		name: uploadResult.filename,
		size: file.size,
		mime: uploadResult.contentType,
		ext: uploadResult.extension
	};

	try {
		const fileMeta = await FileMetaRepository.createFileMeta(fileMetaCreate);
		return toFileMeta(fileMeta);
	} catch (error) {
		await FileStorage.remove(fileMetaCreate.key);
		throw error;
	}
}

export async function uploadFiles(files: File[]): Promise<FileMeta[]> {
	return await Promise.all(files.map(uploadFile));
}

export async function linkArticleToFiles(
	fileIds: FileId[],
	articleId: PostId | PetitionId
): Promise<boolean> {
	await FileMetaRepository.removeArticleIdFromAllFiles(articleId);
	return await FileMetaRepository.addArticleIdToFiles(fileIds, articleId);
}

export async function unlinkArticleFromAllFiles(articleId: PostId | PetitionId): Promise<boolean> {
	return await FileMetaRepository.removeArticleIdFromAllFiles(articleId);
}

export async function cleanupOrphanedFiles(olderThanHours = 24, user: User): Promise<number> {
	assertRule(FileMetaRule.canCleanupOrphanedFiles(user));

	const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
	const orphanedFiles = await FileMetaRepository.findOrphanedFiles(cutoffTime);
	if (orphanedFiles.length === 0) return 0;

	const deleteResults = await Promise.all(
		orphanedFiles.map(async (file) => {
			try {
				await FileStorage.remove(file.key);
				return file._id;
			} catch (err) {
				console.error(`S3 delete failed: ${file.key}`, err);
				return null;
			}
		})
	);

	const deletedIds = deleteResults.filter((id): id is FileId => id !== null);
	if (deletedIds.length > 0) {
		await FileMetaRepository.deleteFileMetasByFileIds(deletedIds);
	}

	return deletedIds.length;
}
