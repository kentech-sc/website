import type { UserId } from './user.type.js';

export type ThrottleId = string;
export type ThrottleBucket = 'article' | 'comment';

export interface ThrottleCreate {
	userId: UserId;
	bucket: ThrottleBucket;
	availableAt: string;
}

export interface ThrottleEntity extends ThrottleCreate {
	_id: ThrottleId;
	createdAt: string;
	updatedAt: string;
}

export type Throttle = ThrottleEntity;
