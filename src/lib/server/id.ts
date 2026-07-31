import { APP_ERROR, AppError } from '$lib/server/errors.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function assertUuid(value: string, notFoundMessage: string): void {
	if (!UUID_PATTERN.test(value)) {
		throw new AppError(APP_ERROR.NOT_FOUND, notFoundMessage);
	}
}
