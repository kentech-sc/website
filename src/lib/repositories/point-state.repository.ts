import type {
	PointStateEntity,
	PointStateCreate,
	PointCapKind
} from '$lib/types/point-state.type.js';
import type { UserId } from '$lib/types/user.type.js';

import { PointStateModel } from '$lib/models/point-state.model.js';
import { toPojo } from '$lib/shared/utils.js';

export async function findPointStateByUserId(userId: UserId): Promise<PointStateEntity | null> {
	return toPojo<PointStateEntity | null>(await PointStateModel.findOne({ userId }).lean());
}

export async function createPointState(
	pointStateCreate: PointStateCreate
): Promise<PointStateEntity> {
	return toPojo<PointStateEntity>((await PointStateModel.create(pointStateCreate)).toObject());
}

export async function updatePointStateByUserIdAndDateKey(
	userId: UserId,
	dateKey: string,
	kind: PointCapKind,
	limit: number
): Promise<PointStateEntity | null> {
	const countPath = `counts.${kind}`;

	return toPojo<PointStateEntity | null>(
		await PointStateModel.findOneAndUpdate(
			{
				userId,
				dateKey,
				[countPath]: { $lt: limit }
			},
			{
				$inc: { [countPath]: 1 }
			},
			{
				returnDocument: 'after'
			}
		).lean()
	);
}

export async function resetPointStateByUserId(
	userId: UserId,
	pointStateCreate: PointStateCreate
): Promise<PointStateEntity | null> {
	return toPojo<PointStateEntity | null>(
		await PointStateModel.findOneAndUpdate(
			{
				userId,
				dateKey: { $ne: pointStateCreate.dateKey }
			},
			{
				$set: pointStateCreate
			},
			{
				returnDocument: 'after'
			}
		).lean()
	);
}
