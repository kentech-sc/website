import type { ServerLoadEvent } from '@sveltejs/kit';

import { consumeServerFlash } from '$lib/server/flash.js';

export const load = async ({ locals, cookies }: ServerLoadEvent) => {
	return {
		user: locals.user,
		flash: consumeServerFlash(cookies)
	};
};
