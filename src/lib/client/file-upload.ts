import type { UploadFileMetadata } from '$lib/shared/file-policy.js';
import type { FileMeta } from '$lib/types/file-meta.type.js';
import type { ActionResult } from '@sveltejs/kit';

import { deserialize } from '$app/forms';
import { optimizeImage } from '$lib/client/image.js';
import { FILE_POLICY } from '$lib/shared/file-policy.js';

type PresignedUpload = {
	url: string;
	method: 'PUT';
	headers: Record<string, string>;
	token: string;
	expiresAt: string;
};

type UploadBatchResult = {
	uploaded: FileMeta[];
	failedCount: number;
};

function actionError(result: ActionResult): Error {
	if (result.type === 'failure') {
		return new Error(String(result.data?.message ?? '요청을 처리하지 못했습니다.'));
	}
	if (result.type === 'error') {
		return new Error(result.error?.message ?? '요청을 처리하지 못했습니다.');
	}
	return new Error('요청이 중단되었습니다.');
}

async function callAction<T>(name: string, formData: FormData): Promise<T> {
	const response = await fetch(`?/${name}`, { method: 'POST', body: formData });
	const result: ActionResult = deserialize(await response.text());
	if (result.type !== 'success') throw actionError(result);
	return result.data as T;
}

async function prepareFiles(files: File[]): Promise<File[]> {
	const prepared: File[] = [];
	for (const file of files) {
		prepared.push(await optimizeImage(file));
	}
	return prepared;
}

function assertFileSizes(files: File[]): void {
	if (files.some((file) => file.size > FILE_POLICY.maxFileSize)) {
		throw new Error('파일 하나의 최대 크기는 20MB입니다.');
	}

	const totalSize = files.reduce((sum, file) => sum + file.size, 0);
	if (totalSize > FILE_POLICY.maxBatchSize) {
		throw new Error('한 번에 최대 50MB까지 업로드할 수 있습니다.');
	}
}

async function presignFiles(files: File[]): Promise<PresignedUpload[]> {
	const metadata: UploadFileMetadata[] = files.map((file) => ({
		filename: file.name,
		contentType: file.type || undefined,
		size: file.size
	}));
	const formData = new FormData();
	formData.set('files', JSON.stringify(metadata));
	const result = await callAction<{ uploads: PresignedUpload[] }>('presignFiles', formData);
	return result.uploads;
}

async function uploadOne(file: File, upload: PresignedUpload): Promise<FileMeta> {
	const response = await fetch(upload.url, {
		method: upload.method,
		headers: upload.headers,
		body: file
	});
	if (!response.ok) throw new Error('파일을 스토리지에 전송하지 못했습니다.');

	const formData = new FormData();
	formData.set('token', upload.token);
	const result = await callAction<{ fileMeta: FileMeta }>('completeFile', formData);
	return result.fileMeta;
}

export async function uploadFiles(files: File[]): Promise<UploadBatchResult> {
	const preparedFiles = await prepareFiles(files);
	assertFileSizes(preparedFiles);
	const uploads = await presignFiles(preparedFiles);
	if (uploads.length !== preparedFiles.length) {
		throw new Error('업로드 준비 결과가 올바르지 않습니다.');
	}

	const results: Array<PromiseSettledResult<FileMeta> | undefined> = new Array(files.length);
	let nextIndex = 0;

	async function worker(): Promise<void> {
		while (nextIndex < preparedFiles.length) {
			const index = nextIndex++;
			try {
				results[index] = {
					status: 'fulfilled',
					value: await uploadOne(preparedFiles[index], uploads[index])
				};
			} catch (reason) {
				results[index] = { status: 'rejected', reason };
			}
		}
	}

	await Promise.all(
		Array.from({ length: Math.min(FILE_POLICY.maxConcurrentUploads, preparedFiles.length) }, worker)
	);

	const completed = results.filter((result): result is PromiseSettledResult<FileMeta> =>
		Boolean(result)
	);
	return {
		uploaded: completed.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : [])),
		failedCount: completed.filter((result) => result.status === 'rejected').length
	};
}
