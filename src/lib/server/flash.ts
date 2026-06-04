import type { Cookies } from '@sveltejs/kit';

import type { FlashMessage } from '$lib/types/flash.type.js';

const FLASH_COOKIE_NAME = 'kentech-sc:flash';
const FLASH_COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax' as const,
	secure: false,
	maxAge: 60
};

export function setServerFlash(cookies: Cookies, flash: FlashMessage): void {
	cookies.set(FLASH_COOKIE_NAME, JSON.stringify(flash), FLASH_COOKIE_OPTIONS);
}

export function consumeServerFlash(cookies: Cookies): FlashMessage | null {
	const raw = cookies.get(FLASH_COOKIE_NAME);
	if (!raw) return null;

	cookies.delete(FLASH_COOKIE_NAME, { path: '/' });

	try {
		return JSON.parse(raw) as FlashMessage;
	} catch {
		return null;
	}
}
