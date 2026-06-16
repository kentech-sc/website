import type { ThrottleBucket, ThrottleCreate } from '$lib/types/throttle.type.js';
import type { UserId } from '$lib/types/user.type.js';

import * as ThrottleRepository from '$lib/repositories/throttle.repository.js';
import { AppError } from '$lib/server/errors.js';
import { APP_ERROR } from '$lib/shared/rule.js';

const THROTTLE_MS: Record<ThrottleBucket, number> = {
	article: 15_000,
	comment: 5_000
};
const THROTTLE_BUCKETS: ThrottleBucket[] = ['article', 'comment'];

function throwThrottleError(
	bucket: ThrottleBucket,
	now: Date,
	throttle?: { availableAt: string } | null
): never {
	const remainingMs =
		throttle === null || throttle === undefined
			? THROTTLE_MS[bucket]
			: new Date(throttle.availableAt).getTime() - now.getTime();
	const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));

	throw new AppError(
		APP_ERROR.TOO_MANY_REQUESTS,
		`잠시 후 다시 시도해 주세요. ${remainingSeconds}초 후에 작성할 수 있습니다.`
	);
}

function createThrottleCreates(userId: UserId, availableAt: string): ThrottleCreate[] {
	return THROTTLE_BUCKETS.map((bucket) => ({
		userId,
		bucket,
		availableAt
	}));
}

export async function createUserThrottles(userId: UserId): Promise<number> {
	const availableAt = new Date().toISOString();
	let createdCount = 0;

	for (const throttleCreate of createThrottleCreates(userId, availableAt)) {
		await ThrottleRepository.createThrottle(throttleCreate);
		createdCount += 1;
	}

	return createdCount;
}

export async function backfillMissingThrottles(userIds: UserId[]): Promise<number> {
	if (userIds.length === 0) return 0;

	const uniqueUserIds = Array.from(new Set(userIds));
	const existingThrottles = await ThrottleRepository.findThrottlesByUserIds(uniqueUserIds);
	const existingThrottleKeys = new Set(
		existingThrottles.map((throttle) => `${throttle.userId}:${throttle.bucket}`)
	);
	const availableAt = new Date().toISOString();
	const missingThrottleCreates = uniqueUserIds.flatMap((userId) =>
		createThrottleCreates(userId, availableAt).filter(
			(throttleCreate) =>
				!existingThrottleKeys.has(`${throttleCreate.userId}:${throttleCreate.bucket}`)
		)
	);

	if (missingThrottleCreates.length === 0) return 0;

	let createdCount = 0;
	for (const throttleCreate of missingThrottleCreates) {
		await ThrottleRepository.createThrottle(throttleCreate);
		createdCount += 1;
	}

	return createdCount;
}

export async function reserve(userId: UserId, bucket: ThrottleBucket) {
	const now = new Date();
	const availableAt = new Date(now.getTime() + THROTTLE_MS[bucket]);
	const nowIso = now.toISOString();
	const availableAtIso = availableAt.toISOString();
	const throttle = await ThrottleRepository.updateThrottleByUserIdAndBucket(
		userId,
		bucket,
		nowIso,
		availableAtIso
	);
	if (throttle) return throttle;

	const existingThrottle = await ThrottleRepository.findThrottleByUserIdAndBucket(userId, bucket);
	if (!existingThrottle) {
		throw new AppError(APP_ERROR.INTERNAL, '도배 방지 상태가 초기화되지 않았습니다.');
	}

	throwThrottleError(bucket, now, existingThrottle);
}
