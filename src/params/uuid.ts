import type { ParamMatcher } from '@sveltejs/kit';

/** 형식이 틀린 id 로 DB 오류(500) 대신 404 가 나도록 라우트에서 먼저 거른다. */
export const match = ((param: string) =>
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
		param
	)) satisfies ParamMatcher;
