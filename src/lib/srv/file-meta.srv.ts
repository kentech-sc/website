import type { FileId, FileMeta, FileMetaDoc } from '$lib/types/file-meta.type.js';
import type { PostId } from '$lib/types/post.type.js';
import type { PetitionId } from '$lib/types/petition.type.js';

import * as FileMetaRepository from '$lib/repo/file-meta.repo.js';

import { RuleError, SrvError } from '$lib/common/errors.js';
import { FileStorage } from '$lib/common/storage.js';
import mongoose from 'mongoose';
import { UserGroup, type User } from '$lib/types/user.type';

function toFileMeta(fileMetaDoc: FileMetaDoc): FileMeta {
	const path = FileStorage.getFilePathFromKey(fileMetaDoc.key);
	return {
		...fileMetaDoc,
		path
	};
}

export async function getFileMetaById(fileId: FileId): Promise<FileMeta> {
	const fileMeta = await FileMetaRepository.getFileMetaById(fileId);
	if (fileMeta === null) throw new SrvError('존재하지 않는 파일입니다.');
	return toFileMeta(fileMeta);
}

export async function getFileMetasByIds(fileIds: FileId[]): Promise<Array<FileMeta | null>> {
	const fileMetas = await FileMetaRepository.getFileMetasByFileIds(fileIds);
	return fileMetas.map((fileMeta) => (fileMeta ? toFileMeta(fileMeta) : null));
}

export async function getFileMetasByArticleId(articleId: PostId | PetitionId): Promise<FileMeta[]> {
	const fileMetas = await FileMetaRepository.getFileMetasByArticleId(articleId);
	return fileMetas.map((fileMeta) => toFileMeta(fileMeta));
}

export async function uploadFile(file: File): Promise<FileMeta> {
	const fileMetaCreate = await FileStorage.uploadFileToStorage(file);

	try {
		const fileMeta = await FileMetaRepository.createFileMeta(fileMetaCreate);
		return toFileMeta(fileMeta);
	} catch (error) {
		await FileStorage.deleteFileFromStorage(fileMetaCreate.key);
		throw error;
	}
}

export async function uploadFiles(files: File[]): Promise<FileMeta[]> {
	return await Promise.all(files.map(uploadFile));
}

export async function deleteFileById(fileId: FileId): Promise<FileMeta> {
	const fileMeta = await getFileMetaById(fileId);

	const isDeleted = await FileMetaRepository.deleteFileMetaById(fileId);
	if (!isDeleted) throw new SrvError('이미 삭제된 파일입니다.');

	try {
		await FileStorage.deleteFileFromStorage(fileMeta.key);
		return fileMeta;
	} catch (error) {
		await FileMetaRepository.createFileMeta(fileMeta);
		throw error;
	}
}

export async function deleteFilesByIds(fileIds: FileId[]): Promise<FileMeta[]> {
	return await Promise.all(fileIds.map(deleteFileById));
}

export async function linkArticleToFiles(fileIds: FileId[], articleId: PostId | PetitionId): Promise<boolean> {
	return await mongoose.connection.transaction(async () => {
		// 먼저 모든 파일에서 해당 게시물 ID 제거
		await FileMetaRepository.removeArticleIdFromAllFiles(articleId);
		// 다시 첨부된 파일만 연결
		return await FileMetaRepository.addArticleIdToFiles(fileIds, articleId);
	});
}

export async function unlinkArticleFromAllFiles(articleId: PostId | PetitionId): Promise<boolean> {
	return await FileMetaRepository.removeArticleIdFromAllFiles(articleId);
}

export async function cleanupOrphanedFiles(olderThanHours: number = 24, user: User): Promise<number> {

	if (user.group !== UserGroup.Dev) throw new RuleError("개발자만 실행할 수 있습니다.");

    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    
    // 1. 삭제할 대상 목록 조회 (ID와 Key가 필요)
    const orphanedFiles = await FileMetaRepository.getOrphanedFiles(cutoffTime);
    if (orphanedFiles.length === 0) return 0;

    const deleteResults = await Promise.all(
        orphanedFiles.map(async (file) => {
            try {
                await FileStorage.deleteFileFromStorage(file.key);
                return file._id; // 성공한 ID만 반환
            } catch (err) {
                console.error(`S3 삭제 실패 (건너뜀): ${file.key}`, err);
                return null; // 실패하면 null
            }
        })
    );

    // 3. S3 삭제에 성공한 것들만 골라내기
    const successfulIds = deleteResults.filter(id => id !== null);

    // 4. DB에서 최종 삭제
    if (successfulIds.length > 0) {
        await FileMetaRepository.deleteFileMetasByFileIds(successfulIds);
    }

    return successfulIds.length;
}
