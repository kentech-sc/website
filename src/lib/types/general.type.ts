export interface Page<T> {
	items: T[];
	totalCount: number;
	totalPages: number;
	currentPage: number;
	limit: number;
	skip: number;
	hasNext: boolean;
	hasPrev: boolean;
}

export type FilePresence = Record<string, { hasImage: boolean; hasFile: boolean }>;
