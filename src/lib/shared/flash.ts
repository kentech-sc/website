import type { FlashMessage } from '$lib/types/general.type.js';

const FLASH_STORAGE_KEY = 'kentech-sc:flash';

export function setClientFlash(flash: FlashMessage): void {
	if (typeof sessionStorage === 'undefined') return;
	sessionStorage.setItem(FLASH_STORAGE_KEY, JSON.stringify(flash));
}

export function popClientFlash(): FlashMessage | null {
	if (typeof sessionStorage === 'undefined') return null;

	const raw = sessionStorage.getItem(FLASH_STORAGE_KEY);
	if (!raw) return null;

	sessionStorage.removeItem(FLASH_STORAGE_KEY);

	try {
		return JSON.parse(raw) as FlashMessage;
	} catch {
		return null;
	}
}
