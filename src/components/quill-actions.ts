import * as FileMetaService from '$lib/srv/file-meta.srv.js';
import { withActionErrorHandling } from '$lib/common/errors.js';

const actions = {
	uploadFile: withActionErrorHandling(async ({ request }) => {
		const formData = await request.formData();
		const files = formData.getAll('files') as File[];

		const fileMetas = await FileMetaService.uploadFiles(files);

		return {
			fileMetas: JSON.stringify(fileMetas)
		};
	}),
};

export default actions;
