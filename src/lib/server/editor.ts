import { fail } from '@sveltejs/kit';
import DOMPurify from 'isomorphic-dompurify';

import type { FileId, FileMeta } from '$lib/types/file-meta.type.js';

import { AppError, withActionErrorHandling } from '$lib/server/errors.js';
import * as FileMetaService from '$lib/services/file-meta.service.js';
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
	const imageById = new Map(imageFileMetas.map((fileMeta) => [fileMeta._id, fileMeta]));
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

		usedImageIds.add(fileMeta._id);
		imageElement.setAttribute('src', fileMeta.path);
		imageElement.setAttribute('data-file-id', fileMeta._id);

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
	uploadFile: withActionErrorHandling(async ({ request, locals }) => {
		if (locals.user.group === 'guest') {
			return fail(403, { message: '로그인이 필요합니다.' });
		}

		const formData = await request.formData();
		const files = formData.getAll('files') as File[];
		const fileMetas = await FileUsecase.uploadFiles(files);

		return { fileMetas };
	})
};

export default editorActions;
