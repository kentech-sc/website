import { initStorage, type Storage, StorageValidationError } from 'secure-s3-storage';

import { AppError } from '$lib/server/errors.js';
import { APP_ERROR } from '$lib/shared/rule.js';

const categories = {
	'files/images': ['jpg', 'jpeg', 'png', 'apng', 'webp'],
	'files/documents': ['pdf', 'txt', 'md', 'json', 'csv', 'yml', 'yaml', 'docx', 'xlsx', 'pptx']
};

export interface FileStorageConfig {
	bucket: string;
	endpoint: string;
	publicBaseUrl: string;
	region: string;
	accessKeyId: string;
	secretAccessKey: string;
	sessionToken?: string;
	maxFileSize: number;
}

export class FileStorage {
	static storage: Storage;
	static maxFileSize: number;

	static async init(config: FileStorageConfig) {
		if (!Number.isSafeInteger(config.maxFileSize) || config.maxFileSize <= 0) {
			throw new Error('MAX_FILE_SIZE must be a positive integer.');
		}

		this.maxFileSize = config.maxFileSize;
		this.storage = initStorage({
			bucket: config.bucket,
			endpoint: config.endpoint,
			publicBaseUrl: config.publicBaseUrl,
			region: config.region,
			accessKeyId: config.accessKeyId,
			secretAccessKey: config.secretAccessKey,
			sessionToken: config.sessionToken,
			categories
		});
	}

	static async upload(file: File) {
		if (file.size > this.maxFileSize) {
			throw new AppError(APP_ERROR.BAD_REQUEST, '파일 크기가 허용 범위를 초과했습니다.');
		}

		try {
			return await this.storage.upload(file);
		} catch (error) {
			if (error instanceof StorageValidationError) {
				throw new AppError(APP_ERROR.BAD_REQUEST, error.message);
			}
			throw error;
		}
	}

	static async remove(key: string) {
		try {
			await this.storage.remove(key);
		} catch (error) {
			if (error instanceof StorageValidationError) {
				throw new AppError(APP_ERROR.BAD_REQUEST, error.message);
			}
			throw error;
		}
	}

	static getUrl(key: string): string {
		try {
			return this.storage.getUrl(key);
		} catch (error) {
			if (error instanceof StorageValidationError) {
				throw new AppError(APP_ERROR.BAD_REQUEST, error.message);
			}
			throw error;
		}
	}
}
