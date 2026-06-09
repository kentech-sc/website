import type { Page } from '$lib/types/general.type';

export function createPage<T>(
	items: T[],
	totalCount: number,
	limit: number,
	skip: number
): Page<T> {
	return {
		items,
		totalCount,
		totalPages: Math.ceil(totalCount / limit),
		currentPage: Math.floor(skip / limit) + 1,
		limit,
		skip,
		hasNext: skip + items.length < totalCount,
		hasPrev: skip > 0
	};
}
