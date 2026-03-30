import quillActions from '$components/quill-actions.js';

import { fail, redirect } from '@sveltejs/kit';
import { withActionErrorHandling } from '$lib/common/errors.js';

import * as PetitionApplication from '$lib/app/petition.app.js';

// The below line is essential to prevent rendering the page without server request which leads to skipping the server hooks.
export const load = () => {};

export const actions = {
	createPetition: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const title = (formData.get('title') ?? '').toString();
		const content = (formData.get('content') ?? '').toString();

		if (!title || !content) return fail(400, { message: 'title, content are required' });

		const fileMetas = formData
			.getAll('fileMetas')
			.map((fileMeta) => JSON.parse((fileMeta ?? '').toString()));
		const fileIds = fileMetas.map((fileMeta) => fileMeta._id);

		const petition = await PetitionApplication.createPetition(title, content, locals.user, fileIds);

		redirect(302, '/petition/' + petition._id);
	}),
	...quillActions
};
