const MB = 1024 * 1024;

export const FILE_POLICY = {
	maxFileSize: 20 * MB,
	maxBatchSize: 50 * MB,
	maxMetadataItems: 100,
	maxConcurrentUploads: 2,
	image: {
		optimizeAboveSize: 2 * MB,
		maxWidth: 2560,
		maxHeight: 2560,
		outputType: 'image/webp',
		quality: 0.85
	}
} as const;

export const FILE_EXTENSIONS = {
	images: ['jpg', 'jpeg', 'png', 'apng', 'webp'],
	documents: ['pdf', 'txt', 'md', 'json', 'csv', 'yml', 'yaml', 'docx', 'xlsx', 'pptx']
} as const;

export type UploadFileMetadata = {
	filename: string;
	contentType?: string;
	size: number;
};
