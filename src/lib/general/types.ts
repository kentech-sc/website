export type ManagerResult<T = void, E = string> =
	| ({ ok: true } & (T extends void ? Record<string, never> : { value: T }))
	| { ok: false; error: E };

export interface ApiResponse<T> {
	success: boolean;
	message?: string;
	data?: T;
}
