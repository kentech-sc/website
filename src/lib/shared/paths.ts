import type { ResolvedPathname } from '$app/types';
import type { BoardId as BoardIdType } from '$lib/types/board.type.js';

import { resolve } from '$app/paths';
import { BoardId } from '$lib/types/board.type.js';

/**
 * Resolve an internal pathname that is supplied at runtime rather than as a
 * statically known SvelteKit route.
 */
export const resolveInternalPath = resolve as unknown as (pathname: string) => ResolvedPathname;

export function boardListPath(boardId: BoardIdType): ResolvedPathname {
	return boardId === BoardId.Bylaw
		? resolve('/bylaw')
		: resolve('/board/[boardId=board]', { boardId });
}

export function boardNewPath(boardId: BoardIdType): ResolvedPathname {
	return boardId === BoardId.Bylaw
		? resolve('/bylaw/new')
		: resolve('/board/[boardId=board]/new', { boardId });
}

export function boardPostPath(boardId: BoardIdType, postId: string): ResolvedPathname {
	return boardId === BoardId.Bylaw
		? resolve('/bylaw/[postId]', { postId })
		: resolve('/board/[boardId=board]/[postId]', { boardId, postId });
}

export function boardEditPath(boardId: BoardIdType, postId: string): ResolvedPathname {
	return boardId === BoardId.Bylaw
		? resolve('/bylaw/[postId]/edit', { postId })
		: resolve('/board/[boardId=board]/[postId]/edit', { boardId, postId });
}
