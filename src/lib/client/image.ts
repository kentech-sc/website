import { FILE_EXTENSIONS, FILE_POLICY } from '$lib/shared/file-policy.js';

const OPTIMIZABLE_IMAGE_EXTENSIONS = new Set<string>(
	FILE_EXTENSIONS.images.filter((extension) => extension !== 'apng')
);

function getExtension(filename: string): string {
	return filename.split('.').pop()?.trim().toLowerCase() ?? '';
}

function createOutputFilename(filename: string): string {
	const base = filename.replace(/\.[^.]+$/, '') || 'image';
	return `${base}.webp`;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
	return new Promise((resolve) => {
		canvas.toBlob(resolve, FILE_POLICY.image.outputType, FILE_POLICY.image.quality);
	});
}

export async function optimizeImage(file: File): Promise<File> {
	const extension = getExtension(file.name);
	if (!OPTIMIZABLE_IMAGE_EXTENSIONS.has(extension)) return file;

	let bitmap: ImageBitmap;
	try {
		bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
	} catch {
		return file;
	}

	try {
		const scale = Math.min(
			1,
			FILE_POLICY.image.maxWidth / bitmap.width,
			FILE_POLICY.image.maxHeight / bitmap.height
		);
		const shouldResize = scale < 1;
		const shouldCompress = file.size > FILE_POLICY.image.optimizeAboveSize;
		if (!shouldResize && !shouldCompress) return file;

		const width = Math.max(1, Math.round(bitmap.width * scale));
		const height = Math.max(1, Math.round(bitmap.height * scale));
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;

		const context = canvas.getContext('2d');
		if (!context) return file;
		context.drawImage(bitmap, 0, 0, width, height);

		const blob = await canvasToBlob(canvas);
		if (!blob || blob.type !== FILE_POLICY.image.outputType) return file;
		if (!shouldResize && blob.size >= file.size) return file;

		return new File([blob], createOutputFilename(file.name), {
			type: blob.type,
			lastModified: file.lastModified
		});
	} finally {
		bitmap.close();
	}
}
