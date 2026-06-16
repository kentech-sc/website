import type {
	CappedPointRule,
	PointStateCreate,
	PointStateEntity
} from '$lib/types/point-state.type.js';
import type { UserId } from '$lib/types/user.type.js';

import * as PointStateRepository from '$lib/repositories/point-state.repository.js';
import * as UserRepository from '$lib/repositories/user.repository.js';
import { AppError } from '$lib/server/errors.js';
import { APP_ERROR } from '$lib/shared/rule.js';
import { PointCapKind } from '$lib/types/point-state.type.js';

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

const POST_CREATE_RULE: CappedPointRule = {
	kind: PointCapKind.POST,
	limit: 1,
	points: 5
};

const COMMENT_CREATE_RULE: CappedPointRule = {
	kind: PointCapKind.COMMENT,
	limit: 5,
	points: 1
};

const REVIEW_CREATE_RULE: CappedPointRule = {
	kind: PointCapKind.REVIEW,
	limit: 1,
	points: 20
};

const PETITION_CREATE_RULE: CappedPointRule = {
	kind: PointCapKind.PETITION,
	limit: 1,
	points: 5
};

function pad(value: number): string {
	return value.toString().padStart(2, '0');
}

function getDateKey(now = new Date()): string {
	const kstNow = new Date(now.getTime() + KST_OFFSET_MS);
	const year = kstNow.getUTCFullYear();
	const month = kstNow.getUTCMonth();
	const date = kstNow.getUTCDate();

	return `${year}-${pad(month + 1)}-${pad(date)}`;
}

function isDuplicateKeyError(error: unknown): boolean {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		typeof error.code === 'number' &&
		error.code === 11000
	);
}

function createInitialPointState(
	userId: UserId,
	dateKey: string,
	kind: PointCapKind
): PointStateCreate {
	return {
		userId,
		dateKey,
		counts: {
			[PointCapKind.POST]: kind === PointCapKind.POST ? 1 : 0,
			[PointCapKind.COMMENT]: kind === PointCapKind.COMMENT ? 1 : 0,
			[PointCapKind.REVIEW]: kind === PointCapKind.REVIEW ? 1 : 0,
			[PointCapKind.PETITION]: kind === PointCapKind.PETITION ? 1 : 0
		}
	};
}

async function incrementPoints(userId: UserId, delta: number) {
	if (delta === 0) return;

	const user = await UserRepository.incrementUserPointsById(userId, delta);
	if (user) return user;

	throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 사용자입니다.');
}

function getCounterValue(
	pointState: PointStateCreate | PointStateEntity,
	kind: PointCapKind
): number {
	return pointState.counts[kind];
}

async function awardCappedPoints(userId: UserId, rule: CappedPointRule): Promise<boolean> {
	const dateKey = getDateKey();
	const kind = rule.kind;

	for (let attempt = 0; attempt < 2; attempt += 1) {
		const sameDatePointState = await PointStateRepository.updatePointStateByUserIdAndDateKey(
			userId,
			dateKey,
			kind,
			rule.limit
		);
		if (sameDatePointState) {
			await incrementPoints(userId, rule.points);
			return true;
		}

		const pointState = await PointStateRepository.findPointStateByUserId(userId);
		const initialPointState = createInitialPointState(userId, dateKey, kind);

		if (pointState === null) {
			try {
				await PointStateRepository.createPointState(initialPointState);
				await incrementPoints(userId, rule.points);
				return true;
			} catch (error) {
				if (!isDuplicateKeyError(error)) throw error;
				continue;
			}
		}

		if (pointState.dateKey === dateKey && getCounterValue(pointState, kind) >= rule.limit) {
			return false;
		}

		const resetPointState = await PointStateRepository.resetPointStateByUserId(
			userId,
			initialPointState
		);
		if (resetPointState) {
			await incrementPoints(userId, rule.points);
			return true;
		}
	}

	return false;
}

export async function awardPostCreate(userId: UserId): Promise<boolean> {
	return await awardCappedPoints(userId, POST_CREATE_RULE);
}

export async function awardCommentCreate(userId: UserId): Promise<boolean> {
	return await awardCappedPoints(userId, COMMENT_CREATE_RULE);
}

export async function awardReviewCreate(userId: UserId): Promise<boolean> {
	return await awardCappedPoints(userId, REVIEW_CREATE_RULE);
}

export async function awardPetitionCreate(userId: UserId): Promise<boolean> {
	return await awardCappedPoints(userId, PETITION_CREATE_RULE);
}

export async function applyPostLikeDelta(postOwnerId: UserId, delta: 1 | -1) {
	await incrementPoints(postOwnerId, delta);
}

export async function applyPetitionSignDelta(petitionerId: UserId, delta: 2 | -2) {
	await incrementPoints(petitionerId, delta);
}
