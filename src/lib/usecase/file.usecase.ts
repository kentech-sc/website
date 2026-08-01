import type { UploadFileMetadata } from '$lib/shared/file-policy.js';

import { FileStorage } from '$lib/server/storage.js';
import * as FileMetaService from '$lib/services/file-meta.service.js';

export async function presignFiles(files: UploadFileMetadata[]) {
	return await Promise.all(files.map((file) => FileStorage.presign(file)));
}

export async function completeUpload(token: string) {
	return await FileMetaService.completeUpload(token);
}
