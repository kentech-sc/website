export const APP_ERROR = {
	BAD_REQUEST: { code: 'BAD_REQUEST', status: 400 },
	UNAUTHORIZED: { code: 'UNAUTHORIZED', status: 401 },
	FORBIDDEN: { code: 'FORBIDDEN', status: 403 },
	NOT_FOUND: { code: 'NOT_FOUND', status: 404 },
	TOO_MANY_REQUESTS: { code: 'TOO_MANY_REQUESTS', status: 429 },
	CONFLICT: { code: 'CONFLICT', status: 409 },
	INVALID_STATE: { code: 'INVALID_STATE', status: 409 },
	INTERNAL: { code: 'INTERNAL', status: 500 }
} as const;

export type AppErrorType = (typeof APP_ERROR)[keyof typeof APP_ERROR];
export type AppErrorCode = AppErrorType['code'];

export type RuleResult =
	| { ok: true }
	| {
			ok: false;
			type: AppErrorType;
			message: string;
	  };

export function ok(): RuleResult {
	return { ok: true };
}

export function ruleFail(type: AppErrorType, message: string): RuleResult {
	return {
		ok: false,
		type,
		message
	};
}
