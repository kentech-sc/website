import type { ThrottleBucket } from '$lib/types/throttle.type.js';
import type { UserId } from '$lib/types/user.type.js';

import * as ThrottleRepository from '$lib/repositories/throttle.repository.js';
import { AppError } from '$lib/server/errors.js';
import { APP_ERROR } from '$lib/shared/rule.js';

const THROTTLE_MS: Record<ThrottleBucket, number> = {
	article: 10_000,
	comment: 3_000
};

function isDuplicateKeyError(error: unknown): boolean {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		typeof error.code === 'number' &&
		error.code === 11000
	);
}

export async function reserve(userId: UserId, bucket: ThrottleBucket) {
	const now = new Date();
	const availableAt = new Date(now.getTime() + THROTTLE_MS[bucket]);
	const nowIso = now.toISOString();
	const availableAtIso = availableAt.toISOString();

	try {
		const throttle = await ThrottleRepository.reserveThrottle(
			userId,
			bucket,
			nowIso,
			availableAtIso
		);
		if (throttle) return throttle;
	} catch (error) {
		if (!isDuplicateKeyError(error)) throw error;
	}

	const throttle = await ThrottleRepository.findThrottleByUserIdAndBucket(userId, bucket);
	if (!throttle) {
		throw new AppError(APP_ERROR.INTERNAL, '도배 방지 상태를 확인하지 못했습니다.');
	}

	const remainingMs = new Date(throttle.availableAt).getTime() - now.getTime();
	const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
	throw new AppError(
		APP_ERROR.TOO_MANY_REQUESTS,
		`잠시 후 다시 시도해 주세요. ${remainingSeconds}초 후에 작성할 수 있습니다.`
	);
}
