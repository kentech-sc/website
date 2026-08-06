import type { CappedPointRule, PointEntryCreate } from '$lib/types/point.type.js';
import type { UserId } from '$lib/types/user.type.js';

import * as PointRepository from '$lib/repositories/point.repository.js';
import { AppError } from '$lib/server/errors.js';
import { APP_ERROR } from '$lib/shared/rule.js';

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

const POST_CREATE_RULE: CappedPointRule = {
	eventType: 'post.created',
	dailyLimit: 1,
	amount: 5,
	sourceType: 'post'
};

const COMMENT_CREATE_RULE: CappedPointRule = {
	eventType: 'comment.created',
	dailyLimit: 5,
	amount: 1,
	sourceType: 'comment'
};

const REVIEW_CREATE_RULE: CappedPointRule = {
	eventType: 'review.created',
	dailyLimit: 1,
	amount: 20,
	sourceType: 'review'
};

const PETITION_CREATE_RULE: CappedPointRule = {
	eventType: 'petition.created',
	dailyLimit: 1,
	amount: 5,
	sourceType: 'petition'
};

function pad(value: number): string {
	return value.toString().padStart(2, '0');
}

function getDateKey(now = new Date()): string {
	const kstNow = new Date(now.getTime() + KST_OFFSET_MS);
	return `${kstNow.getUTCFullYear()}-${pad(kstNow.getUTCMonth() + 1)}-${pad(kstNow.getUTCDate())}`;
}

async function applyEntry(entry: PointEntryCreate): Promise<void> {
	if (entry.amount === 0) return;
	if (await PointRepository.applyEntry(entry)) return;
	throw new AppError(APP_ERROR.INTERNAL, '포인트 변경 내역을 저장하지 못했습니다.');
}

async function awardCappedPoints(
	userId: UserId,
	sourceId: string,
	rule: CappedPointRule
): Promise<boolean> {
	const eligible = await PointRepository.incrementDailyEventCount(
		userId,
		getDateKey(),
		rule.eventType,
		rule.dailyLimit
	);
	if (!eligible) return false;

	await applyEntry({
		userId,
		eventType: rule.eventType,
		amount: rule.amount,
		sourceType: rule.sourceType,
		sourceId,
		idempotencyKey: `${rule.eventType}:${sourceId}`
	});
	return true;
}

export async function awardPostCreate(userId: UserId, postId: string): Promise<boolean> {
	return await awardCappedPoints(userId, postId, POST_CREATE_RULE);
}

export async function awardCommentCreate(userId: UserId, commentId: string): Promise<boolean> {
	return await awardCappedPoints(userId, commentId, COMMENT_CREATE_RULE);
}

export async function awardReviewCreate(userId: UserId, reviewId: string): Promise<boolean> {
	return await awardCappedPoints(userId, reviewId, REVIEW_CREATE_RULE);
}

export async function awardPetitionCreate(userId: UserId, petitionId: string): Promise<boolean> {
	return await awardCappedPoints(userId, petitionId, PETITION_CREATE_RULE);
}

export async function applyPostLikeDelta(
	postOwnerId: UserId,
	postId: string,
	actorId: UserId,
	delta: 1 | -1
): Promise<void> {
	await applyEntry({
		userId: postOwnerId,
		eventType: delta > 0 ? 'post.liked' : 'post.unliked',
		amount: delta,
		sourceType: 'post',
		sourceId: postId,
		metadata: { actorId }
	});
}

export async function applyPetitionSignDelta(
	petitionerId: UserId,
	petitionId: string,
	actorId: UserId,
	delta: 2 | -2
): Promise<void> {
	await applyEntry({
		userId: petitionerId,
		eventType: delta > 0 ? 'petition.signed' : 'petition.unsigned',
		amount: delta,
		sourceType: 'petition',
		sourceId: petitionId,
		metadata: { actorId }
	});
}
