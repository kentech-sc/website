import PetitionService from '$lib/petition/service';
import { fail, redirect } from '@sveltejs/kit';

// The below line is essential to prevent rendering the page without server request which leads to skipping the server hooks.
export const load = () => {};

export const actions = {
	createPetition: async ({ request, locals }) => {
		const formData = await request.formData();
		const title = (formData.get('title') ?? '').toString();
		const content = (formData.get('content') ?? '').toString();

		if (!title || !content) return fail(400, { message: 'title, content are required' });

		const petition = await PetitionService.createPetition(title, content, locals.user._id);
		redirect(302, '/petition/' + petition._id);
	}
};
