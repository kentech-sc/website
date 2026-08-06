import type { UserId } from './user.type.js';

export interface CappedPointRule {
	eventType: string;
	dailyLimit: number;
	amount: number;
	sourceType: string;
}

export interface PointEntryCreate {
	userId: UserId;
	eventType: string;
	amount: number;
	sourceType?: string;
	sourceId?: string;
	idempotencyKey?: string;
	metadata?: Record<string, unknown>;
}
