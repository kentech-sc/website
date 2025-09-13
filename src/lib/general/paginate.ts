import type { Post } from '$lib/board/types';
import type { Comment } from '$lib/board/types';
import type { Review } from '$lib/review/types';
import type { Petition } from '$lib/petition/types';

import type { Model, FilterQuery, Types } from 'mongoose';

export async function paginateModel<T extends Post | Comment | Review | Petition>(
	model: Model<T>,
	filterQuery: FilterQuery<T>,
	limit = 10,
	opts?: { fromId?: Types.ObjectId; toId?: Types.ObjectId }
): Promise<{ pageItems: T[]; fromId?: Types.ObjectId; toId?: Types.ObjectId }> {
	const { fromId, toId } = opts ?? {};

	if (toId && fromId) {
		throw new Error('toId와 fromId는 동시에 적용할 수 없습니다.');
	}

	let pageItems: T[] = [];

	if (toId) {
		pageItems = (
			await model
				.find({ ...filterQuery, _id: { $gt: toId } })
				.sort({ createdAt: 1 })
				.limit(limit)
				.lean<T[]>()
		).toReversed();
	} else if (fromId) {
		pageItems = await model
			.find({ ...filterQuery, _id: { $lt: fromId } })
			.sort({ createdAt: -1 })
			.limit(limit)
			.lean<T[]>();
	} else {
		pageItems = await model.find(filterQuery).sort({ createdAt: -1 }).limit(limit).lean<T[]>();
	}

	if (pageItems.length > 0) {
		const hasNext = await model.exists({
			...filterQuery,
			createdAt: { $lt: pageItems.at(-1)?.createdAt }
		});

		const hasPrev = await model.exists({
			...filterQuery,
			createdAt: { $gt: pageItems.at(0)?.createdAt }
		});

		return {
			pageItems,
			fromId: hasNext ? pageItems.at(-1)?._id : undefined,
			toId: hasPrev ? pageItems.at(0)?._id : undefined
		};
	} else {
		return { pageItems, fromId: undefined, toId: undefined };
	}
}
