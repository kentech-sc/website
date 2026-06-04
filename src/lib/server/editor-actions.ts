import { fail } from '@sveltejs/kit';

import { withActionErrorHandling } from '$lib/server/errors.js';
import * as FileUsecase from '$lib/usecase/file.usecase.js';

const actions = {
	uploadFile: withActionErrorHandling(async ({ request, locals }) => {
		if (locals.user.group === 'guest') {
			return fail(403, { message: '로그인이 필요합니다.' });
		}

		const formData = await request.formData();
		const files = formData.getAll('files') as File[];
		const fileMetas = await FileUsecase.uploadFiles(files);

		return { fileMetas };
	})
};

export default actions;
