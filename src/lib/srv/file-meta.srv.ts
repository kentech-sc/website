import type { FileId, FileMeta } from '$lib/types/file-meta.type.js';

import * as FileMetaRepository from '$lib/repo/file-meta.repo.js';

import { RuleError, SrvError } from '$lib/common/errors.js';
import { FileStorage } from '$lib/common/storage.js';

export async function getFileMetaById(fileId: FileId): Promise<FileMeta> {
	const fileMeta = await FileMetaRepository.getFileMetaById(fileId);
	if (!fileMeta) throw new SrvError('존재하지 않는 파일입니다.');
	fileMeta.path = FileStorage.getFilePathFromKey(fileMeta.key);
	return fileMeta;
}

export async function getFileMetasByIds(fileIds: FileId[]): Promise<Array<FileMeta|null>> {
	const fileMetas = await FileMetaRepository.getFileMetasByFileIds(fileIds);
	return fileMetas.map((fileMeta) => {
		if (!fileMeta) return null;
		fileMeta.path = FileStorage.getFilePathFromKey(fileMeta.key);
		return fileMeta;
	});
}

export async function uploadFile(file: File): Promise<FileMeta> {
	const fileMetaCreate = await FileStorage.uploadFileToStorage(file);
	const fileMeta = await FileMetaRepository.createFileMeta(fileMetaCreate);
	fileMeta.path = FileStorage.getFilePathFromKey(fileMeta.key);
	return fileMeta;
}

export async function uploadFiles(files: File[]): Promise<FileMeta[]> {
	const fileMetas = [];
	for (const file of files) {
		fileMetas.push(await uploadFile(file));
	}
	return fileMetas;
	// return (await Promise.allSettled(files.map((file) => uploadFile(file))))
}

export async function deleteFileById(fileId: FileId): Promise<FileMeta | null> {
	const fileMeta = await getFileMetaById(fileId);
	if (!fileMeta) throw new SrvError('존재하지 않는 파일입니다.');
	await FileStorage.deleteFileFromStorage(fileMeta.key);
	const deletedFileMeta = await FileMetaRepository.deleteFileMetaById(fileId);
	if (!deletedFileMeta) throw new SrvError('존재하지 않는 파일입니다.');
	return deletedFileMeta;
}

export async function deleteFilesByIds(fileIds: FileId[]) {
	for (const fileId of fileIds) {
		await deleteFileById(fileId);
	}
}
