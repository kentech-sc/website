import type { ParamMatcher } from '@sveltejs/kit';

import { BoardId } from '$lib/types/board.type.js';

export const match = ((param: string): param is BoardId => {
	return param === BoardId.Free || param === BoardId.Notice || param === BoardId.Bylaw;
}) satisfies ParamMatcher;
