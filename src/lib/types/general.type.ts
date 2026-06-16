import type { PetitionEntity } from './petition.type.js';
import type { PostEntity } from './post.type.js';
import type { ReviewEntity } from './review.type.js';

export type Capability =
	| 'board.free.write'
	| 'board.notice.write'
	| 'board.bylaw.write'
	| 'post.like'
	| 'post.moderate'
	| 'comment.write'
	| 'comment.moderate'
	| 'review.write'
	| 'review.moderate'
	| 'petition.write'
	| 'petition.sign'
	| 'petition.delete.any'
	| 'petition.manage'
	| 'petition.respond'
	| 'course.manage'
	| 'professor.manage'
	| 'user.manage'
	| 'system.cleanup';

export type AppErrorCode =
	| 'BAD_REQUEST'
	| 'UNAUTHORIZED'
	| 'FORBIDDEN'
	| 'NOT_FOUND'
	| 'TOO_MANY_REQUESTS'
	| 'CONFLICT'
	| 'INVALID_STATE'
	| 'INTERNAL';

export type AppErrorType =
	| { code: 'BAD_REQUEST'; status: 400 }
	| { code: 'UNAUTHORIZED'; status: 401 }
	| { code: 'FORBIDDEN'; status: 403 }
	| { code: 'NOT_FOUND'; status: 404 }
	| { code: 'TOO_MANY_REQUESTS'; status: 429 }
	| { code: 'CONFLICT'; status: 409 }
	| { code: 'INVALID_STATE'; status: 409 }
	| { code: 'INTERNAL'; status: 500 };

export type RuleResult =
	| { ok: true }
	| {
			ok: false;
			type: AppErrorType;
			message: string;
	  };

export type MaybePromise = void | Promise<void>;
export type ActionSimpleCallback = () => MaybePromise;

export type FlashKind = 'info' | 'success' | 'error';

export type FlashMessage = {
	kind: FlashKind;
	message: string;
};

export type CommonFormPolicy =
	| 'inline'
	| 'reload'
	| {
			kind: 'detail';
			notFoundRedirectTo: string;
	  };

export type PaginationItem = number | 'ellipsis';

export interface ImageAttrs {
	src?: string | null;
	alt?: string | null;
	title?: string | null;
	width?: number | null;
	height?: number | null;
	fileId?: string | null;
}

export interface SelectionHint {
	from: number;
	to: number;
}

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
