import type { Throttle, ThrottleBucket } from '$lib/types/throttle.type.js';
import type { UserId } from '$lib/types/user.type.js';

import { ThrottleModel } from '$lib/models/throttle.model.js';
import { toPojo } from '$lib/shared/utils.js';

export async function reserveThrottle(
	userId: UserId,
	bucket: ThrottleBucket,
	now: string,
	availableAt: string
): Promise<Throttle | null> {
	return toPojo<Throttle | null>(
		await ThrottleModel.findOneAndUpdate(
			{
				userId,
				bucket,
				availableAt: { $lte: now }
			},
			{
				$set: { availableAt },
				$setOnInsert: { userId, bucket }
			},
			{
				upsert: true,
				returnDocument: 'after'
			}
		).lean()
	);
}

export async function findThrottleByUserIdAndBucket(
	userId: UserId,
	bucket: ThrottleBucket
): Promise<Throttle | null> {
	return toPojo<Throttle | null>(
		await ThrottleModel.findOne({ userId, bucket }).session(null).lean()
	);
}
