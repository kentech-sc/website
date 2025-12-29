import type { FileId, FileMeta, FileMetaDoc } from '$lib/types/file-meta.type.js';

import * as FileMetaRepository from '$lib/repo/file-meta.repo.js';

import { SrvError } from '$lib/common/errors.js';
import { FileStorage } from '$lib/common/storage.js';

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

export async function uploadFile(file: File): Promise<FileMeta> {
	const fileMetaCreate = await FileStorage.uploadFileToStorage(file);
	const fileMeta = await FileMetaRepository.createFileMeta(fileMetaCreate);
	return toFileMeta(fileMeta);
}

export async function uploadFiles(files: File[]): Promise<FileMeta[]> {
	return await Promise.all(files.map(uploadFile));
}

export async function deleteFileById(fileId: FileId): Promise<FileMeta> {
	const fileMeta = await getFileMetaById(fileId);

	const isDeleted = await FileMetaRepository.deleteFileMetaById(fileId);
	if (!isDeleted) throw new SrvError('이미 삭제된 파일입니다.');

	await FileStorage.deleteFileFromStorage(fileMeta.key);

	return fileMeta;
}

export async function deleteFilesByIds(fileIds: FileId[]): Promise<FileMeta[]> {
	return await Promise.all(fileIds.map(deleteFileById));
}
