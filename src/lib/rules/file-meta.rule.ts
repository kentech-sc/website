import { fileTypeFromBuffer } from 'file-type';
import DOMPurify from 'isomorphic-dompurify';

import { MAX_FILE_SIZE } from '$env/static/private';
import type { User } from '$lib/types/user.type.js';
import { hasCapability } from '$lib/shared/permission.js';
import { APP_ERROR, ok, ruleFail, type RuleResult } from '$lib/shared/rule.js';

const MAX_SIZE_NUM = MAX_FILE_SIZE ? Number(MAX_FILE_SIZE) : 30 * 1024 * 1024;

export const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'pdf', 'docx', 'xlsx', 'svg'];

export const ALLOWED_MIME_TYPES = [
	'image/png',
	'image/jpeg',
	'image/webp',
	'image/svg+xml',
	'application/pdf',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

export function canCleanupOrphanedFiles(user: User): RuleResult {
	if (hasCapability(user, 'system.cleanup')) return ok();
	return ruleFail(APP_ERROR.FORBIDDEN, '정리 작업을 실행할 권한이 없습니다.');
}

export function sanitizeSvg(svgString: string): string {
	let cleaned = DOMPurify.sanitize(svgString, {
		USE_PROFILES: { svg: true, svgFilters: true }
	});

	cleaned = cleaned.replace(/href="http[^"]+"/gi, 'href="#"');
	cleaned = cleaned.replace(/xlink:href="http[^"]+"/gi, 'xlink:href="#"');

	return cleaned;
}

export async function validateAndProcessFile(file: File): Promise<{
	ok: boolean;
	code?:
		| 'FILE_TOO_LARGE'
		| 'INVALID_EXTENSION'
		| 'MIME_MISMATCH'
		| 'INVALID_FILE_TYPE'
		| 'INVALID_OFFICE_FILE_MAGIC'
		| 'INVALID_OFFICE_FILE_BROWSER'
		| 'INVALID_OFFICE_FILE';
	mime?: string;
	sanitizedSvg?: string;
}> {
	if (file.size > MAX_SIZE_NUM) {
		return { ok: false, code: 'FILE_TOO_LARGE' };
	}

	const fileName = file.name.toLowerCase();
	const ext = fileName.split('.').pop();
	if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
		return { ok: false, code: 'INVALID_EXTENSION' };
	}

	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	const detected = await fileTypeFromBuffer(buffer);
	const mimeFromMagic = detected?.mime;
	const mimeFromBrowser = file.type;

	if (ext === 'svg') {
		if (mimeFromBrowser !== 'image/svg+xml') {
			return { ok: false, code: 'MIME_MISMATCH' };
		}
		const svgText = buffer.toString('utf-8');
		const safe = sanitizeSvg(svgText);

		return { ok: true, mime: 'image/svg+xml', sanitizedSvg: safe };
	}

	if (ext === 'pdf') {
		if (mimeFromMagic !== 'application/pdf') {
			return { ok: false, code: 'MIME_MISMATCH' };
		}
		return { ok: true, mime: 'application/pdf' };
	}

	if (ext === 'docx' || ext === 'xlsx') {
		const expectedMime =
			ext === 'docx'
				? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
				: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

		const isValidMagic = mimeFromMagic === 'application/zip' || mimeFromMagic === expectedMime;

		if (mimeFromMagic && !isValidMagic) {
			return { ok: false, code: 'INVALID_OFFICE_FILE_MAGIC' };
		}

		if (mimeFromBrowser !== expectedMime) {
			// 일부 환경에서는 브라우저 MIME 값이 부정확할 수 있다.
			// return { ok: false, code: 'INVALID_OFFICE_FILE_BROWSER' };
		}

		return { ok: true, mime: expectedMime };
	}

	const isImage =
		mimeFromMagic && ['image/png', 'image/jpeg', 'image/webp'].includes(mimeFromMagic);
	if (isImage) {
		return { ok: true, mime: mimeFromMagic };
	}

	return { ok: false, code: 'INVALID_FILE_TYPE' };
}
