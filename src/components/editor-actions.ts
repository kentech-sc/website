import * as FileMetaService from '$lib/srv/file-meta.srv.js';
import { fail } from '@sveltejs/kit';
import { withActionErrorHandling } from '$lib/common/errors.js';

const actions = {
	uploadFile: withActionErrorHandling(async ({ request, locals }) => {
		if (locals.user.group === 'guest') {
			return fail(403, { message: '로그인이 필요합니다.' });
		}

		const formData = await request.formData();
		const files = formData.getAll('files') as File[];

		const fileMetas = await FileMetaService.uploadFiles(files);

		return {
			fileMetas: JSON.stringify(fileMetas)
		};
	})
};

export default actions;
