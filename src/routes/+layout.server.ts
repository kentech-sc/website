import type { ServerLoadEvent } from '@sveltejs/kit';

export const csr = false;
export const prerender = false;

export const load = async ({ locals }: ServerLoadEvent): Promise<{ user: string }> => {
	return {
		user: JSON.stringify(locals.user)
	};
};
