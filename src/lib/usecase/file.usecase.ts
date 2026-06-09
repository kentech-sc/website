import * as FileMetaService from '$lib/services/file-meta.service.js';

export async function uploadFiles(files: File[]) {
	return await FileMetaService.uploadFiles(files);
}
