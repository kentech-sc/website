import type { BoardId } from '$lib/types/board.type.js';
import type { ParamMatcher } from '@sveltejs/kit';

import { BoardId as Board } from '$lib/types/board.type.js';

export const match = ((param: string): param is BoardId => {
	return param === Board.Notice || param === Board.Free;
}) satisfies ParamMatcher;
