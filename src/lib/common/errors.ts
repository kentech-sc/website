// Application & Service Layer에서 발생한 오류
export class SrvError extends Error {
	constructor(message: string) {
		super(message);
	}
}

// Rule Layer에서 발생한 오류
export class RuleError extends Error {
	constructor(message: string) {
		super(message);
	}
}

import { fail, error, isRedirect } from '@sveltejs/kit';
import type { ServerLoadEvent, Action } from '@sveltejs/kit';

export function withLoadErrorHandling<T>(fn: (event: ServerLoadEvent) => Promise<T>) {
	return async (event: ServerLoadEvent) => {
		try {
			return await fn(event);
		} catch (err) {
			if (isRedirect(err)) throw err;
			if (err instanceof RuleError) throw error(400, { status: 400, message: err.message });
			if (err instanceof SrvError) throw error(500, { status: 500, message: err.message });
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
			if (err instanceof RuleError) return fail(400, { message: err.message });
			if (err instanceof SrvError) return fail(500, { message: err.message });
			throw err;
		}
	};
}
