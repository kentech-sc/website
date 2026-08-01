import { fail } from '@sveltejs/kit';
import DOMPurify from 'isomorphic-dompurify';

import type { UploadFileMetadata } from '$lib/shared/file-policy.js';
import type { FileId, FileMeta } from '$lib/types/file-meta.type.js';

import { AppError, withActionErrorHandling } from '$lib/server/errors.js';
import * as FileMetaService from '$lib/services/file-meta.service.js';
import * as ThrottleService from '$lib/services/throttle.service.js';
import { FILE_POLICY } from '$lib/shared/file-policy.js';
import { APP_ERROR } from '$lib/shared/rule.js';
import * as FileUsecase from '$lib/usecase/file.usecase.js';

function createUniqueFileIds(fileIds: string[]): FileId[] {
	return [...new Set(fileIds.map((fileId) => fileId.trim()).filter(Boolean))];
}

function isImageFile(fileMeta: FileMeta): boolean {
	return fileMeta.mime.startsWith('image/');
}

export async function normalizeEditorContent(
	content: string,
	submittedFileIds: string[]
): Promise<{ content: string; fileIds: FileId[] }> {
	const body = DOMPurify.sanitize(content, { RETURN_DOM: true }) as HTMLBodyElement;
	const imageElements = Array.from(body.querySelectorAll('img'));
	const imageIdsInContent = createUniqueFileIds(
		imageElements.map((imageElement) => imageElement.getAttribute('data-file-id') ?? '')
	);
	const uniqueSubmittedFileIds = createUniqueFileIds(submittedFileIds);
	const candidateFileIds = createUniqueFileIds([...uniqueSubmittedFileIds, ...imageIdsInContent]);

	const fileMetas = await FileMetaService.findFileMetasByIds(candidateFileIds);
	if (fileMetas.some((fileMeta) => fileMeta === null)) {
		throw new AppError(APP_ERROR.BAD_REQUEST, '유효하지 않은 파일 정보가 포함되어 있습니다.');
	}

	const resolvedFileMetas = fileMetas as FileMeta[];
	const imageFileMetas = resolvedFileMetas.filter(isImageFile);
	const imageById = new Map(imageFileMetas.map((fileMeta) => [fileMeta.id, fileMeta]));
	const imageByPath = new Map(imageFileMetas.map((fileMeta) => [fileMeta.path, fileMeta]));
	const attachmentIds = uniqueSubmittedFileIds.filter((fileId) => !imageById.has(fileId));
	const usedImageIds = new Set<FileId>();

	for (const imageElement of imageElements) {
		imageElement.removeAttribute('srcset');
		imageElement.removeAttribute('sizes');

		const fileId = imageElement.getAttribute('data-file-id')?.trim() ?? '';
		const src = imageElement.getAttribute('src')?.trim() ?? '';
		const fileMeta = (fileId ? imageById.get(fileId) : undefined) ?? imageByPath.get(src);

		if (!fileMeta) {
			throw new AppError(
				APP_ERROR.BAD_REQUEST,
				'본문 이미지는 업로드 버튼으로 추가한 이미지만 사용할 수 있습니다.'
			);
		}

		usedImageIds.add(fileMeta.id);
		imageElement.setAttribute('src', fileMeta.path);
		imageElement.setAttribute('data-file-id', fileMeta.id);

		if (!imageElement.getAttribute('alt')) {
			imageElement.setAttribute('alt', fileMeta.name);
		}
	}

	return {
		content: body.innerHTML,
		fileIds: [...attachmentIds, ...usedImageIds]
	};
}

export const editorActions = {
	presignFiles: withActionErrorHandling(async ({ request, locals }) => {
		if (locals.user.group === 'guest') {
			return fail(403, { message: '로그인이 필요합니다.' });
		}

		const formData = await request.formData();
		const files = parseUploadMetadata(formData.get('files'));
		const totalSize = files.reduce((sum, file) => sum + file.size, 0);
		if (totalSize > FILE_POLICY.maxBatchSize) {
			throw new AppError(APP_ERROR.BAD_REQUEST, '한 번에 최대 50MB까지 업로드할 수 있습니다.');
		}

		await ThrottleService.reserve(locals.user.id, 'upload');
		const uploads = await FileUsecase.presignFiles(files);
		return { uploads };
	}),

	completeFile: withActionErrorHandling(async ({ request, locals }) => {
		if (locals.user.group === 'guest') {
			return fail(403, { message: '로그인이 필요합니다.' });
		}

		const formData = await request.formData();
		const token = formData.get('token');
		if (typeof token !== 'string' || !token.trim()) {
			throw new AppError(APP_ERROR.BAD_REQUEST, '업로드 token이 필요합니다.');
		}

		const fileMeta = await FileUsecase.completeUpload(token);
		return { fileMeta };
	})
};

function parseUploadMetadata(value: FormDataEntryValue | null): UploadFileMetadata[] {
	if (typeof value !== 'string') {
		throw new AppError(APP_ERROR.BAD_REQUEST, '파일 정보가 필요합니다.');
	}

	let parsed: unknown;
	try {
		parsed = JSON.parse(value);
	} catch {
		throw new AppError(APP_ERROR.BAD_REQUEST, '파일 정보가 올바르지 않습니다.');
	}

	if (
		!Array.isArray(parsed) ||
		parsed.length === 0 ||
		parsed.length > FILE_POLICY.maxMetadataItems
	) {
		throw new AppError(APP_ERROR.BAD_REQUEST, '한 번에 처리할 파일 정보가 너무 많습니다.');
	}

	return parsed.map((item) => {
		if (!item || typeof item !== 'object') {
			throw new AppError(APP_ERROR.BAD_REQUEST, '파일 정보가 올바르지 않습니다.');
		}
		const { filename, contentType, size } = item as Record<string, unknown>;
		if (
			typeof filename !== 'string' ||
			(contentType !== undefined && typeof contentType !== 'string') ||
			!Number.isSafeInteger(size) ||
			(size as number) < 0 ||
			(size as number) > FILE_POLICY.maxFileSize
		) {
			throw new AppError(APP_ERROR.BAD_REQUEST, '파일 정보가 올바르지 않습니다.');
		}

		return {
			filename,
			contentType: contentType as string | undefined,
			size: size as number
		};
	});
}

export default editorActions;
