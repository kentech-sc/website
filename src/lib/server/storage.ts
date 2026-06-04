import {
	DeleteObjectCommand,
	HeadObjectCommand,
	PutObjectCommand,
	S3Client
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

import { MAX_FILE_SIZE } from '$env/static/private';

import type { FileKey, FileMetaCreate } from '$lib/types/file-meta.type.js';
import { APP_ERROR } from '$lib/shared/rule.js';
import { parseDate } from '$lib/shared/utils.js';
import { AppError } from '$lib/server/errors.js';
import { validateAndProcessFile } from '$lib/rules/file-meta.rule.js';

const MAX_SIZE_NUM = MAX_FILE_SIZE ? Number(MAX_FILE_SIZE) : 30 * 1024 * 1024;

function getFileValidationMessage(
	code:
		| 'FILE_TOO_LARGE'
		| 'INVALID_EXTENSION'
		| 'MIME_MISMATCH'
		| 'INVALID_FILE_TYPE'
		| 'INVALID_OFFICE_FILE_MAGIC'
		| 'INVALID_OFFICE_FILE_BROWSER'
		| 'INVALID_OFFICE_FILE'
		| undefined
): string {
	switch (code) {
		case 'FILE_TOO_LARGE':
			return '파일 크기가 허용 범위를 초과했습니다.';
		case 'INVALID_EXTENSION':
			return '허용되지 않는 파일 확장자입니다.';
		case 'MIME_MISMATCH':
			return '파일 형식이 올바르지 않습니다.';
		case 'INVALID_FILE_TYPE':
			return '지원하지 않는 파일 형식입니다.';
		case 'INVALID_OFFICE_FILE_MAGIC':
		case 'INVALID_OFFICE_FILE_BROWSER':
		case 'INVALID_OFFICE_FILE':
			return '손상되었거나 올바르지 않은 Office 파일입니다.';
		default:
			return '유효하지 않은 파일입니다.';
	}
}

function getCategoryByExtension(ext: string): string {
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
		if (file.size > MAX_SIZE_NUM) {
			throw new AppError(APP_ERROR.BAD_REQUEST, '파일 크기가 허용 범위를 초과했습니다.');
		}

		const result = await validateAndProcessFile(file);
		if (!result.ok) {
			throw new AppError(APP_ERROR.BAD_REQUEST, getFileValidationMessage(result.code));
		}

		const buffer = result.sanitizedSvg
			? Buffer.from(result.sanitizedSvg, 'utf-8')
			: Buffer.from(await file.arrayBuffer());

		const ext = file.name.split('.').pop()?.toLowerCase() || '';
		const date = parseDate(new Date(), 'date');
		const category = getCategoryByExtension(ext);
		const key = `files/${category}/${date}/${randomUUID()}.${ext}`;

		const command = new PutObjectCommand({
			Bucket: this.#BUCKET_NAME,
			Key: key,
			Body: buffer,
			ContentType: result.mime
		});

		try {
			await this.#storage.send(command);
			if (!(await this.checkObjectExists(key))) {
				throw new AppError(APP_ERROR.INTERNAL, '파일 업로드 검증에 실패했습니다.');
			}

			return {
				key: key as FileKey,
				name: file.name,
				size: buffer.length,
				mime: result.mime as string,
				ext
			};
		} catch (err) {
			if (err instanceof AppError) throw err;
			throw new AppError(APP_ERROR.INTERNAL, '스토리지와 통신하는 중 오류가 발생했습니다.');
		}
	}

	static async deleteFileFromStorage(key: string): Promise<void> {
		const command = new DeleteObjectCommand({
			Bucket: this.#BUCKET_NAME,
			Key: key
		});

		try {
			await this.#storage.send(command);
			if (await this.checkObjectExists(key)) {
				throw new AppError(APP_ERROR.INTERNAL, '파일 삭제 검증에 실패했습니다.');
			}
		} catch (err) {
			if (err instanceof AppError) throw err;
			throw new AppError(APP_ERROR.INTERNAL, '스토리지에서 파일을 삭제하는 중 오류가 발생했습니다.');
		}
	}
}
