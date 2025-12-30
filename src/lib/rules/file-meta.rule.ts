import { fileTypeFromBuffer } from 'file-type';
import DOMPurify from "isomorphic-dompurify";

// -----------------------------
// 허용된 확장자 + MIME 타입
// -----------------------------
export const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp', 'pdf', 'docx', 'xlsx', 'svg'];

export const allowedMimeTypes = [
	// images
	'image/png',
	'image/jpeg',
	'image/webp',
	'image/svg+xml',

	// documents
	'application/pdf',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // xlsx
];

// -----------------------------
// SVG sanitize 함수
// -----------------------------

export function sanitizeSvg(svgString: string): string {
	let cleaned = DOMPurify.sanitize(svgString, { USE_PROFILES: { svg: true, svgFilters: true } });

	cleaned = cleaned.replace(/href="http[^"]+"/gi, '');
	cleaned = cleaned.replace(/xlink:href="http[^"]+"/gi, '');

	return cleaned;
	// return svgString;
}

// -----------------------------
// 파일 검증 + (SVG면 sanitize)
// -----------------------------
export async function validateAndProcessFile(file: File): Promise<{
	ok: boolean;
	sanitizedSvg?: string; // svg일 때만 반환됨
}> {
	const fileName = file.name.toLowerCase();
	const ext = fileName.split('.').pop();
	if (!ext || !allowedExtensions.includes(ext)) {
		return { ok: false };
	}

	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	const mimeFromBrowser = file.type;
	const detected = await fileTypeFromBuffer(buffer);
	const mimeFromMagic = detected?.mime;

	// -----------------------------
	// SVG 처리
	// -----------------------------
	if (ext === 'svg') {
		if (mimeFromBrowser !== 'image/svg+xml') return { ok: false };

		// sanitize SVG
		const svgText = buffer.toString('utf-8');
		const safe = sanitizeSvg(svgText);

		return { ok: true, sanitizedSvg: safe };
	}

	// -----------------------------
	// PDF
	// -----------------------------
	if (ext === 'pdf') {
		return { ok: mimeFromMagic === 'application/pdf' };
	}

	// -----------------------------
	// DOCX (Word)
	// -----------------------------
	if (ext === 'docx') {
		return {
			ok:
				mimeFromBrowser ===
				'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
		};
	}

	// -----------------------------
	// XLSX (Excel)
	// -----------------------------
	if (ext === 'xlsx') {
		return {
			ok: mimeFromBrowser === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		};
	}

	// -----------------------------
	// 이미지 (PNG / JPG / WEBP)
	// -----------------------------
	if (mimeFromMagic && allowedMimeTypes.includes(mimeFromMagic)) {
		return { ok: true };
	}

	// fallback
	return { ok: allowedMimeTypes.includes(mimeFromBrowser) };
}
