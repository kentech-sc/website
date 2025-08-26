export type ManagerResult<T = void, E = string> =
  | (T extends void ? { ok: true } : { ok: true; value: T })
  | { ok: false; error: E };

export interface ApiResponse<T> {
	success: boolean;
	message?: string;
	data?: T;
}
