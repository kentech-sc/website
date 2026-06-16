import type { ThrottleBucket, ThrottleCreate, ThrottleEntity } from '$lib/types/throttle.type.js';
import type { UserId } from '$lib/types/user.type.js';

import { ThrottleModel } from '$lib/models/throttle.model.js';
import { toPojo } from '$lib/shared/utils.js';

export async function createThrottle(throttleCreate: ThrottleCreate): Promise<ThrottleEntity> {
	return toPojo<ThrottleEntity>((await ThrottleModel.create(throttleCreate)).toObject());
}

export async function findThrottlesByUserIds(userIds: UserId[]): Promise<ThrottleEntity[]> {
	return toPojo<ThrottleEntity[]>(await ThrottleModel.find({ userId: { $in: userIds } }).lean());
}

export async function updateThrottleByUserIdAndBucket(
	userId: UserId,
	bucket: ThrottleBucket,
	now: string,
	availableAt: string
): Promise<ThrottleEntity | null> {
	return toPojo<ThrottleEntity | null>(
		await ThrottleModel.findOneAndUpdate(
			{
				userId,
				bucket,
				availableAt: { $lte: now }
			},
			{
				$set: { availableAt }
			},
			{
				returnDocument: 'after'
			}
		).lean()
	);
}

export async function findThrottleByUserIdAndBucket(
	userId: UserId,
	bucket: ThrottleBucket
): Promise<ThrottleEntity | null> {
	return toPojo<ThrottleEntity | null>(
		await ThrottleModel.findOne({ userId, bucket }).session(null).lean()
	);
}
