import type { PetitionEntity } from './petition.type.js';
import type { PostEntity } from './post.type.js';
import type { ReviewEntity } from './review.type.js';

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

export type SearchEntity = PostEntity | ReviewEntity | PetitionEntity;
