import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

import { parseDate } from '$lib/common/utils.js';
import { validateAndProcessFile } from '$lib/rules/file-meta.rule.js';
import { RuleError } from '$lib/common/errors.js';

import type { FileKey, FileMetaBase } from '$lib/types/file-meta.type.js';

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

	static async uploadFileToStorage(file: File): Promise<FileMetaBase> {
		const result = await validateAndProcessFile(file);
		if (!result.ok) throw new RuleError('The file is wrong or not allowed');

		let buffer;
		if (result.sanitizedSvg) {
			// svg일 경우 → sanitize된 텍스트를 업로드
			buffer = Buffer.from(result.sanitizedSvg, 'utf-8');
		} else {
			// 그 외 → 원본 업로드
			buffer = Buffer.from(await file.arrayBuffer());
		}

		const ext = file.name.split('.').pop();
		if (!ext) throw new RuleError('The file extension is wrong or not allowed');

		const date = parseDate(new Date(), 'date');
		const category = getCategoryByExtension(ext);
		const key = `${category}/${date}/${randomUUID()}.${ext}`;

		const mimetype = file.type;
		const command = new PutObjectCommand({
			Bucket: this.#BUCKET_NAME,
			Key: key,
			Body: buffer,
			ContentType: mimetype
		});

		await this.#storage.send(command);

		const fileName = file.name;

		return {
			key: key as FileKey, // S3 key
			name: fileName, // original name
			size: buffer.length, // file size in bytes
			mime: mimetype, // MIME type
			ext: ext // extension
		};
	}

	static async deleteFileFromStorage(key: string): Promise<void> {
		const command = new DeleteObjectCommand({
			Bucket: this.#BUCKET_NAME,
			Key: key
		});
		await this.#storage.send(command);
	}

	// static async uploadBackupToStorage(fileKey: string, content: string) {
	//     await this.#storage.send(
	//         new PutObjectCommand({
	//             Bucket: this.#BUCKET_NAME,
	//             Key: `backups/${fileKey}`,
	//             Body: content,
	//             ContentType: 'application/json',
	//         }),
	//     );
	// }
}
