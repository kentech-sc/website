import type { UserId } from '$lib/types/user.type.js';
import {
	type PetitionCreate,
	type PetitionId,
	type PetitionUpdate,
	type PetitionEntity,
	PetitionStatus
} from '$lib/types/petition.type.js';

import { PetitionModel } from '$lib/models/petition.model.js';
import { toPojo } from '$lib/shared/utils.js';

export async function countPetitions(): Promise<number> {
	return await PetitionModel.countDocuments();
}

export async function createPetition(petition: PetitionCreate): Promise<PetitionEntity> {
	return toPojo<PetitionEntity>((await PetitionModel.create(petition)).toObject());
}

export async function findPetitionById(petitionId: PetitionId): Promise<PetitionEntity | null> {
	return toPojo<PetitionEntity | null>(await PetitionModel.findOne({ _id: petitionId }).lean());
}

export async function findRecentPetitions(limit: number, skip = 0): Promise<Array<PetitionEntity>> {
	return toPojo<PetitionEntity[]>(
		await PetitionModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean()
	);
}

export async function updatePetitionById(
	petitionId: PetitionId,
	petition: PetitionUpdate
): Promise<PetitionEntity | null> {
	return toPojo<PetitionEntity | null>(
		await PetitionModel.findOneAndUpdate({ _id: petitionId }, petition, {
			returnDocument: 'after'
		}).lean()
	);
}

export async function deletePetitionById(petitionId: PetitionId): Promise<boolean> {
	const res = await PetitionModel.deleteOne({ _id: petitionId });
	return res.deletedCount > 0;
}

export async function viewPetitionById(petitionId: PetitionId): Promise<PetitionEntity | null> {
	return toPojo<PetitionEntity | null>(
		await PetitionModel.findOneAndUpdate(
			{ _id: petitionId },
			{ $inc: { viewCnt: 1 } },
			{ returnDocument: 'after' }
		).lean()
	);
}

export async function signPetitionById(
	petitionId: PetitionId,
	userId: UserId
): Promise<PetitionEntity | null> {
	return toPojo<PetitionEntity | null>(
		await PetitionModel.findOneAndUpdate(
			{
				_id: petitionId,
				status: { $nin: [PetitionStatus.Answered, PetitionStatus.Expired] },
				petitionerId: { $ne: userId } // write-guard for UX performance - prevent self-signing
			},
			{ $addToSet: { signedBy: userId } },
			{ returnDocument: 'after' }
		).lean()
	);
}

export async function unsignPetitionById(
	petitionId: PetitionId,
	userId: UserId
): Promise<PetitionEntity | null> {
	return toPojo<PetitionEntity | null>(
		await PetitionModel.findOneAndUpdate(
			{ _id: petitionId, status: { $nin: [PetitionStatus.Answered, PetitionStatus.Expired] } },
			{ $pull: { signedBy: userId } },
			{ returnDocument: 'after' }
		).lean()
	);
}

export async function searchPetitionsByQuery(
	q: string,
	page = 1,
	limit = 10
): Promise<{ items: PetitionEntity[]; more: boolean }> {
	const results = await PetitionModel.find(
		{ $text: { $search: q } },
		{ searchScore: { $meta: 'textScore' } }
	)
		.sort({ searchScore: { $meta: 'textScore' }, createdAt: -1 })
		.skip((page - 1) * limit)
		.limit(limit + 1)
		.lean();

	return { items: toPojo<PetitionEntity[]>(results.slice(0, limit)), more: results.length > limit };
}
