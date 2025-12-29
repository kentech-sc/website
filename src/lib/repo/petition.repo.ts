import type { UserId } from '$lib/types/user.type.js';
import {
	type PetitionCreate,
	type PetitionId,
	type PetitionUpdate,
	type PetitionDoc,
	PetitionStatus
} from '$lib/types/petition.type.js';

import { PetitionModel } from '$lib/models/petition.model.js';

import { paginateModel } from '$lib/common/paginate.js';

export async function createPetition(petition: PetitionCreate): Promise<PetitionDoc> {
	return (await PetitionModel.create(petition)).toObject();
}

export async function getPetitionById(petitionId: PetitionId): Promise<PetitionDoc | null> {
	return await PetitionModel.findOne({ _id: petitionId }).lean();
}

export async function getPetitions(
	limit = 10,
	{ fromId, toId }: { fromId?: PetitionId; toId?: PetitionId } = {}
): Promise<{ pageItems: PetitionDoc[]; fromId?: PetitionId; toId?: PetitionId }> {
	return await paginateModel(PetitionModel, {}, limit, { fromId, toId });
}

export async function updatePetitionById(
	petitionId: PetitionId,
	petition: PetitionUpdate
): Promise<PetitionDoc | null> {
	return await PetitionModel.findOneAndUpdate({ _id: petitionId }, petition, {
		new: true
	}).lean();
}

export async function deletePetitionById(petitionId: PetitionId): Promise<boolean> {
	const res = await PetitionModel.deleteOne({ _id: petitionId });
	return res.deletedCount > 0;
}

export async function viewPetitionById(petitionId: PetitionId): Promise<PetitionDoc | null> {
	return await PetitionModel.findOneAndUpdate(
		{ _id: petitionId },
		{ $inc: { viewCnt: 1 } },
		{ new: true }
	).lean();
}

export async function signPetitionById(
	petitionId: PetitionId,
	userId: UserId
): Promise<PetitionDoc | null> {
	return await PetitionModel.findOneAndUpdate(
		{
			_id: petitionId,
			status: { $nin: [PetitionStatus.Answered, PetitionStatus.Expired] },
			petitionerId: { $ne: userId } // write-guard for UX performance - prevent self-signing
		},
		{ $addToSet: { signedBy: userId } },
		{ new: true }
	).lean();
}

export async function unsignPetitionById(
	petitionId: PetitionId,
	userId: UserId
): Promise<PetitionDoc | null> {
	return await PetitionModel.findOneAndUpdate(
		{ _id: petitionId, status: { $nin: [PetitionStatus.Answered, PetitionStatus.Expired] } },
		{ $pull: { signedBy: userId } },
		{ new: true }
	).lean();
}

export async function searchPetitionsByQuery(
	q: string,
	page = 1,
	limit = 10
): Promise<{ items: PetitionDoc[]; more: boolean }> {
	const results = await PetitionModel.find(
		{ $text: { $search: q } },
		{ searchScore: { $meta: 'textScore' } }
	)
		.sort({ searchScore: { $meta: 'textScore' }, createdAt: -1 })
		.skip((page - 1) * limit)
		.limit(limit + 1)
		.lean();

	return { items: results.slice(0, limit), more: results.length > limit };
}
