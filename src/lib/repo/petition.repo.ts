import type { UserId } from '$lib/types/user.type.js';
import type {
	PetitionCreate,
	Petition,
	PetitionId,
	PetitionUpdate
} from '$lib/types/petition.type.js';

import { PetitionModel } from '$lib/models/petition.model.js';

import { paginateModel } from '$lib/common/paginate.js';

export async function createPetition(petition: PetitionCreate): Promise<Petition> {
	return (await PetitionModel.create(petition)).toObject();
}

export async function getPetitionById(petitionId: PetitionId): Promise<Petition | null> {
	return await PetitionModel.findOne({ _id: petitionId }).lean();
}

export async function getPetitions(
	limit = 10,
	{ fromId, toId }: { fromId?: PetitionId; toId?: PetitionId } = {}
): Promise<{ pageItems: Petition[]; fromId?: PetitionId; toId?: PetitionId }> {
	return await paginateModel(PetitionModel, {}, limit, { fromId, toId });
}

export async function updatePetitionById(
	petitionId: PetitionId,
	petition: PetitionUpdate
): Promise<Petition | null> {
	return await PetitionModel.findOneAndUpdate({ _id: petitionId }, petition, {
		new: true
	}).lean();
}

export async function deletePetitionById(petitionId: PetitionId): Promise<Petition | null> {
	return await PetitionModel.findOneAndDelete({ _id: petitionId }).lean();
}

export async function viewPetitionById(petitionId: PetitionId): Promise<Petition | null> {
	return await PetitionModel.findOneAndUpdate(
		{ _id: petitionId },
		{ $inc: { viewCnt: 1 } },
		{ new: true }
	).lean();
}

export async function deleteAllPetitions(): Promise<void> {
	await PetitionModel.deleteMany();
}

export async function signPetitionById(
	petitionId: PetitionId,
	userId: UserId
): Promise<Petition | null> {
	return await PetitionModel.findOneAndUpdate(
		{
			_id: petitionId,
			signedBy: { $ne: userId },
			status: { $nin: ['answered', 'expired'] },
			petitionerId: { $ne: userId }
		},
		{ $push: { signedBy: userId }, $inc: { signCnt: 1 } },
		{ new: true }
	).lean();
}

export async function unsignPetitionById(
	petitionId: PetitionId,
	userId: UserId
): Promise<Petition | null> {
	return await PetitionModel.findOneAndUpdate(
		{ _id: petitionId, signedBy: userId, status: { $nin: ['answered', 'expired'] } },
		{ $pull: { signedBy: userId }, $inc: { signCnt: -1 } },
		{ new: true }
	).lean();
}

export async function searchPetitionByQuery(q: string, page = 1, limit = 10): Promise<Petition[]> {
	const results = await PetitionModel.find(
		{ $text: { $search: q } },
		{ searchScore: { $meta: 'textScore' } }
	)
		.sort({ searchScore: { $meta: 'textScore' }, createdAt: -1 })
		.skip((page - 1) * limit)
		.limit(limit + 1)
		.lean();
	return results;
}
