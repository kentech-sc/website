import { fileTypeFromBuffer } from 'file-type';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// -----------------------------
// DOMPurify 초기화 (서버 시작 시 단 1회만)
// -----------------------------
const window = new JSDOM('').window;
const purify = DOMPurify(window);

purify.setConfig({
	USE_PROFILES: { svg: true },
	FORBID_TAGS: ['script', 'foreignObject', 'iframe', 'embed', 'object'],
	FORBID_ATTR: [
		'onload',
		'onerror',
		'onclick',
		'onmouseover',
		'onmouseenter',
		'onmouseleave',
		'onmousemove',
		'onwheel'
	]
});

// -----------------------------
// 허용된 확장자 + MIME 타입
// -----------------------------
export const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'pdf', 'docx', 'xlsx'];

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
	let cleaned = purify.sanitize(svgString, { RETURN_TRUSTED_TYPE: false });

	// 외부 URL 제거
	cleaned = cleaned.replace(/href="http[^"]+"/gi, '');
	cleaned = cleaned.replace(/xlink:href="http[^"]+"/gi, '');

	return cleaned;
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
