import { createStorage, type Storage, StorageError } from 'secure-s3-storage';

import { AppError } from '$lib/server/errors.js';
import { FILE_EXTENSIONS, FILE_POLICY, type UploadFileMetadata } from '$lib/shared/file-policy.js';
import { APP_ERROR } from '$lib/shared/rule.js';

const categories = {
	'files/images': [...FILE_EXTENSIONS.images],
	'files/documents': [...FILE_EXTENSIONS.documents]
};

const imageExtensions = new Set<string>(FILE_EXTENSIONS.images);
const documentExtensions = new Set<string>(FILE_EXTENSIONS.documents);

export interface FileStorageConfig {
	bucket: string;
	endpoint: string;
	publicBaseUrl: string;
	region: string;
	accessKeyId: string;
	secretAccessKey: string;
	sessionToken?: string;
	signingSecret: string;
	forcePathStyle?: boolean;
}

export class FileStorage {
	static storage: Storage;
	static init(config: FileStorageConfig) {
		this.storage = createStorage({
			bucket: config.bucket,
			endpoint: config.endpoint,
			publicBaseUrl: config.publicBaseUrl,
			region: config.region,
			credentials: {
				accessKeyId: config.accessKeyId,
				secretAccessKey: config.secretAccessKey,
				sessionToken: config.sessionToken
			},
			signingSecret: config.signingSecret,
			forcePathStyle: config.forcePathStyle,
			maxFileSize: FILE_POLICY.maxFileSize,
			categories
		});
	}

	static async presign(metadata: UploadFileMetadata) {
		try {
			return await this.storage.presign(resolveCategory(metadata.filename), metadata);
		} catch (error) {
			throwStorageError(error);
		}
	}

	static async complete(token: string) {
		try {
			return await this.storage.complete(token);
		} catch (error) {
			throwStorageError(error);
		}
	}

	static async remove(key: string) {
		try {
			await this.storage.remove(key);
		} catch (error) {
			throwStorageError(error);
		}
	}

	static getUrl(key: string): string {
		try {
			return this.storage.getUrl(key);
		} catch (error) {
			throwStorageError(error);
		}
	}
}

function resolveCategory(filename: string): keyof typeof categories {
	const extension = filename.split('.').pop()?.trim().toLowerCase() ?? '';
	if (imageExtensions.has(extension)) return 'files/images';
	if (documentExtensions.has(extension)) return 'files/documents';
	throw new AppError(APP_ERROR.BAD_REQUEST, '지원하지 않는 파일 형식입니다.');
}

function throwStorageError(error: unknown): never {
	if (!(error instanceof StorageError)) throw error;
	if (error.code === 'INVALID_CONFIG' || error.code === 'STORAGE_ERROR') throw error;
	throw new AppError(APP_ERROR.BAD_REQUEST, error.message);
}
