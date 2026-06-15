import type { UserId } from './user.type.js';

export type ThrottleBucket = 'article' | 'comment';

export interface Throttle {
	_id: string;
	userId: UserId;
	bucket: ThrottleBucket;
	availableAt: string;
	createdAt: string;
	updatedAt: string;
}
