import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
	HeadObjectCommand,
	GetObjectCommand
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

import type { FileKey, FileMetaCreate } from '$lib/types/file-meta.type.js';

import { parseDate } from '$lib/common/utils.js';
import { validateAndProcessFile } from '$lib/rules/file-meta.rule.js';
import { RuleError, SrvError } from '$lib/common/errors.js';

// 카테고리 분류 로직 (확장자 기반)
export function getCategoryByExtension(ext: string): string {
	switch (ext) {
		case 'png':
		case 'jpg':
		case 'jpeg':
		case 'webp':
		case 'svg':
			return 'images';
		case 'pdf':
			return 'pdf';
		case 'docx':
			return 'docs';
		case 'xlsx':
			return 'excels';
		default:
			return 'others';
	}
}

export class FileStorage {
	static #storage: S3Client;
	static #BUCKET_NAME: string;
	static #BUCKET_URL: string;

	static async init(AWS_BUCKET_NAME: string, AWS_ID: string, AWS_SECRET: string) {
		this.#BUCKET_NAME = AWS_BUCKET_NAME;
		this.#BUCKET_URL = `https://${AWS_BUCKET_NAME}.s3.ap-northeast-2.amazonaws.com`;
		this.#storage = new S3Client({
			region: 'ap-northeast-2',
			credentials: {
				accessKeyId: AWS_ID,
				secretAccessKey: AWS_SECRET
			}
		});
	}

	static getFilePathFromKey(key: string): string {
		return `${this.#BUCKET_URL}/${key}`;
	}

	static async checkObjectExists(key: string): Promise<boolean> {
		try {
			await this.#storage.send(
				new HeadObjectCommand({
					Bucket: this.#BUCKET_NAME,
					Key: key
				})
			);
			return true;
		} catch {
			return false;
		}
	}

	static async uploadFileToStorage(file: File): Promise<FileMetaCreate> {
		// 1. 도메인 규칙 검증 (용량, 확장자, 매직넘버, SVG 새니타이징)
		const result = await validateAndProcessFile(file);

		// 실패 시 상세 코드와 함께 에러 투척
		if (!result.ok) {
			throw new RuleError(result.code || 'INVALID_FILE');
		}

		// 2. 업로드용 버퍼 준비
		// SVG는 새니타이징된 텍스트를, 나머지는 원본을 사용
		const buffer = result.sanitizedSvg
			? Buffer.from(result.sanitizedSvg, 'utf-8')
			: Buffer.from(await file.arrayBuffer());

		const ext = file.name.split('.').pop()?.toLowerCase() || '';
		const date = parseDate(new Date(), 'date');
		const category = getCategoryByExtension(ext);

		// S3 저장 경로 (Key) 생성
		const key = `files/${category}/${date}/${randomUUID()}.${ext}`;

		// 3. S3 업로드 실행
		// 여기서 ContentType을 result.mime으로 지정하는 것이 핵심 (브라우저 출력용)
		const command = new PutObjectCommand({
			Bucket: this.#BUCKET_NAME,
			Key: key,
			Body: buffer,
			ContentType: result.mime
		});

		try {
			await this.#storage.send(command);

			// 업로드 확인
			if (!(await this.checkObjectExists(key))) {
				throw new SrvError('UPLOAD_VERIFICATION_FAILED');
			}

			return {
				key: key as FileKey,
				name: file.name,
				size: buffer.length, // 가공된(새니타이징 등) 최종 크기
				mime: result.mime as string,
				ext: ext
			};
		} catch (_error) {
			// console.error('[S3_UPLOAD_ERROR]', error);
			throw new SrvError('S3_COMMUNICATION_FAILURE');
		}
	}

	static async getFileStream(key: string): Promise<{
		stream: ReadableStream;
		contentType?: string;
		contentLength?: number;
	}> {
		const command = new GetObjectCommand({ Bucket: this.#BUCKET_NAME, Key: key });
		const response = await this.#storage.send(command);
		if (!response.Body) throw new SrvError('FILE_NOT_FOUND');
		// 전체를 메모리에 적재하지 않고 스트림으로 흘려보낸다 (Vercel 응답 본문 한도 회피)
		return {
			stream: response.Body.transformToWebStream(),
			contentType: response.ContentType,
			contentLength: response.ContentLength
		};
	}

	static async deleteFileFromStorage(key: string): Promise<void> {
		const command = new DeleteObjectCommand({
			Bucket: this.#BUCKET_NAME,
			Key: key
		});

		try {
			await this.#storage.send(command);

			// 삭제 확인
			if (await this.checkObjectExists(key)) {
				throw new SrvError('DELETE_VERIFICATION_FAILED');
			}
		} catch (_error) {
			// console.error('[S3_DELETE_ERROR]', error);
			throw new SrvError('S3_DELETE_FAILURE');
		}
	}
}
