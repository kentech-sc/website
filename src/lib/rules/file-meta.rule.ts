import { fileTypeFromBuffer } from 'file-type';
import DOMPurify from 'isomorphic-dompurify';

import { MAX_FILE_SIZE } from '$env/static/private';

// -----------------------------
// 설정 및 상수
// -----------------------------
// 문자열을 숫자로 변환 (값이 없을 경우를 대비해 기본값 30MB 설정)
const MAX_SIZE_NUM = MAX_FILE_SIZE ? Number(MAX_FILE_SIZE) : 30 * 1024 * 1024;

export const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'pdf', 'docx', 'xlsx', 'svg'];

export const ALLOWED_MIME_TYPES = [
	'image/png',
	'image/jpeg',
	'image/webp',
	'image/svg+xml',
	'application/pdf',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // xlsx
];

/**
 * SVG 내부의 위험한 스크립트 및 외부 링크 제거
 */
export function sanitizeSvg(svgString: string): string {
	let cleaned = DOMPurify.sanitize(svgString, {
		USE_PROFILES: { svg: true, svgFilters: true }
	});

	// 외부로 나가는 http 링크 추가 방어 (선택 사항)
	cleaned = cleaned.replace(/href="http[^"]+"/gi, 'href="#"');
	cleaned = cleaned.replace(/xlink:href="http[^"]+"/gi, 'xlink:href="#"');

	return cleaned;
}

/**
 * 파일 검증 및 전처리 핵심 로직
 */
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
	// 1. 용량 체크 (메모리 버퍼 생성 전 최우선 실행)
	if (file.size > MAX_SIZE_NUM) {
		return { ok: false, code: 'FILE_TOO_LARGE' };
	}

	// 2. 확장자 체크
	const fileName = file.name.toLowerCase();
	const ext = fileName.split('.').pop();
	if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
		return { ok: false, code: 'INVALID_EXTENSION' };
	}

	// 3. 파일 분석을 위한 버퍼 생성
	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	// 4. 매직 넘버(파일 시그니처) 및 브라우저 MIME 분석
	const detected = await fileTypeFromBuffer(buffer);
	const mimeFromMagic = detected?.mime;
	const mimeFromBrowser = file.type;

	// -----------------------------
	// 분기 처리: SVG
	// -----------------------------
	if (ext === 'svg') {
		// SVG는 바이너리가 아닌 텍스트 기반이므로 브라우저 타입 확인 후 새니타이징
		if (mimeFromBrowser !== 'image/svg+xml') {
			return { ok: false, code: 'MIME_MISMATCH' };
		}
		const svgText = buffer.toString('utf-8');
		const safe = sanitizeSvg(svgText);

		return { ok: true, mime: 'image/svg+xml', sanitizedSvg: safe };
	}

	// -----------------------------
	// 분기 처리: PDF
	// -----------------------------
	if (ext === 'pdf') {
		// PDF는 매직 넘버가 확실함 (application/pdf)
		if (mimeFromMagic !== 'application/pdf') {
			return { ok: false, code: 'MIME_MISMATCH' };
		}
		return { ok: true, mime: 'application/pdf' };
	}

	// -----------------------------
	// 분기 처리: Office (docx, xlsx)
	// -----------------------------
	if (ext === 'docx' || ext === 'xlsx') {
    const expectedMime =
        ext === 'docx'
            ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    // 1. 매직 넘버가 ZIP이거나, 이미 기대한 오피스 MIME과 정확히 일치하는지 확인
    const isValidMagic = 
        mimeFromMagic === 'application/zip' || 
        mimeFromMagic === expectedMime;

    // 2. 브라우저 MIME 검증 (브라우저는 간혹 틀릴 수 있으므로 매직 넘버를 더 신뢰)
    const isValidBrowser = mimeFromBrowser === expectedMime;

    // 최종 판정: 매직 넘버가 올바르거나, 브라우저 값이 올바르다면 통과
    // (보안을 위해 둘 다 체크하되, 매직 넘버가 존재한다면 반드시 유효해야 함)
    if (mimeFromMagic && !isValidMagic) {
        return { ok: false, code: 'INVALID_OFFICE_FILE_MAGIC' };
    }

    // 브라우저 MIME이 예상과 다르면 경고 정도로 처리하거나, 엄격하게 하려면 아래 유지
    if (mimeFromBrowser !== expectedMime) {
        // 일부 환경 대응을 위해 로그를 남기거나 유연하게 처리 가능
        // return { ok: false, code: 'INVALID_OFFICE_FILE_BROWSER' };
    }

    return { ok: true, mime: expectedMime };
}
	

	// -----------------------------
	// 분기 처리: 일반 이미지 (PNG, JPG, WEBP)
	// -----------------------------
	const isImage =
		mimeFromMagic && ['image/png', 'image/jpeg', 'image/webp'].includes(mimeFromMagic);
	if (isImage) {
		return { ok: true, mime: mimeFromMagic };
	}

	// 최종 실패 (ZIP 등 허용되지 않은 파일 포함)
	return { ok: false, code: 'INVALID_FILE_TYPE' };
}
