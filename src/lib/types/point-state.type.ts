import type { UserId } from './user.type.js';

export type PointStateId = string;

export const PointCapKind = {
	POST: 'post',
	COMMENT: 'comment',
	REVIEW: 'review',
	PETITION: 'petition',
} as const;

export type PointCapKind = (typeof PointCapKind)[keyof typeof PointCapKind];

export interface CappedPointRule {
	kind: PointCapKind;
	limit: number;
	points: number;
}

export interface PointStateCreate {
	userId: UserId;
	dateKey: string;
	counts: Record<PointCapKind, number>;
}

export interface PointStateEntity extends PointStateCreate {
	_id: PointStateId;
	createdAt: string;
	updatedAt: string;
}

export type PointState = PointStateEntity;
