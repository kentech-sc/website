import { error, fail, isRedirect } from '@sveltejs/kit';

import type { AppErrorCode, AppErrorType, RuleResult } from '$lib/types/general.type.js';
import type { Action, ServerLoadEvent } from '@sveltejs/kit';

import { APP_ERROR } from '$lib/shared/rule.js';

export { APP_ERROR };

export class AppError extends Error {
	type: AppErrorType;
	code: AppErrorCode;
	status: number;

	constructor(type: AppErrorType, message: string) {
		super(message);
		this.name = 'AppError';
		this.type = type;
		this.code = type.code;
		this.status = type.status;
	}
}

export function assertRule(result: RuleResult): void {
	if (result.ok) return;
	throw new AppError(result.type, result.message);
}

export function withLoadErrorHandling<T>(fn: (event: ServerLoadEvent) => Promise<T>) {
	return async (event: ServerLoadEvent) => {
		try {
			return await fn(event);
		} catch (err) {
			if (isRedirect(err)) throw err;
			if (err instanceof AppError) {
				throw error(err.status, { status: err.status, message: err.message });
			}
			throw err;
		}
	};
}

export function withActionErrorHandling<T>(fn: (event: Parameters<Action>[0]) => Promise<T>) {
	return async (event: Parameters<Action>[0]) => {
		try {
			return await fn(event);
		} catch (err) {
			if (isRedirect(err)) throw err;
			if (err instanceof AppError) {
				return fail(err.status, { message: err.message, code: err.code });
			}
			throw err;
		}
	};
}
