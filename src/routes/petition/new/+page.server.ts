import editorActions from '$components/editor-actions.js';

import { fail, redirect } from '@sveltejs/kit';
import { withActionErrorHandling } from '$lib/common/errors.js';

import * as PetitionApplication from '$lib/app/petition.app.js';
import { Types } from 'mongoose';

// The below line is essential to prevent rendering the page without server request which leads to skipping the server hooks.
export const load = () => {};

export const actions = {
	createPetition: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const title = (formData.get('title') ?? '').toString();
		const content = (formData.get('content') ?? '').toString();

		if (!title || !content) return fail(400, { message: 'title, content are required' });

		const fileIds = formData
			.getAll('fileIds')
			.map((fileId) => new Types.ObjectId(fileId.toString()));

		const petition = await PetitionApplication.createPetition(title, content, locals.user, fileIds);

		redirect(302, '/petition/' + petition._id);
	}),
	...editorActions
};
