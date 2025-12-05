import * as FileMetaService from '$lib/srv/file-meta.srv.js';
import { Types } from 'mongoose';

import { withActionErrorHandling } from '$lib/common/errors.js';

import type { FileId } from '$lib/types/file-meta.type.js';

const actions = {
	uploadFile: withActionErrorHandling(async ({ request }) => {
		const formData = await request.formData();
		const files = formData.getAll('files') as File[];

		const fileMetas = await FileMetaService.uploadFiles(files);

		return JSON.stringify(fileMetas);
	}),

	deleteFile: withActionErrorHandling(async ({ request }) => {
		const formData = await request.formData();

		const fileIdRaw = (formData.get('fileId') ?? '').toString();
		const fileId: FileId = new Types.ObjectId(fileIdRaw);

		const deletedFileMeta = await FileMetaService.deleteFileById(fileId);

		return { deletedFileMeta: JSON.stringify(deletedFileMeta) };
	})
};

export default actions;
