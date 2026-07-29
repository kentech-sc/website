import mongoose from 'mongoose';

import { APP_ERROR, AppError } from '$lib/server/errors.js';

export function assertObjectId(value: string, notFoundMessage: string): void {
	if (!mongoose.isObjectIdOrHexString(value)) {
		throw new AppError(APP_ERROR.NOT_FOUND, notFoundMessage);
	}
}
