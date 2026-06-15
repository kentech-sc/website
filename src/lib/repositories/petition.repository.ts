import type { UserId } from '$lib/types/user.type.js';

import { PetitionModel } from '$lib/models/petition.model.js';
import { toPojo } from '$lib/shared/utils.js';
import {
	type PetitionCreate,
	type PetitionId,
	type PetitionEntity,
	PetitionStatus
} from '$lib/types/petition.type.js';

export async function countPetitions(): Promise<number> {
	return await PetitionModel.countDocuments();
}

export async function countPetitionsByQuery(query: string): Promise<number> {
	return await PetitionModel.countDocuments({ $text: { $search: query } });
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
				petitionerId: { $ne: userId },
				signedBy: { $ne: userId }
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
			{
				_id: petitionId,
				status: { $nin: [PetitionStatus.Answered, PetitionStatus.Expired] },
				signedBy: userId
			},
			{ $pull: { signedBy: userId } },
			{ returnDocument: 'after' }
		).lean()
	);
}

export async function reviewPetitionById(petitionId: PetitionId): Promise<PetitionEntity | null> {
	return toPojo<PetitionEntity | null>(
		await PetitionModel.findOneAndUpdate(
			{ _id: petitionId, status: PetitionStatus.Pending },
			{ status: PetitionStatus.Reviewing },
			{ returnDocument: 'after' }
		).lean()
	);
}

export async function unreviewPetitionById(petitionId: PetitionId): Promise<PetitionEntity | null> {
	return toPojo<PetitionEntity | null>(
		await PetitionModel.findOneAndUpdate(
			{ _id: petitionId, status: PetitionStatus.Reviewing },
			{ status: PetitionStatus.Pending },
			{ returnDocument: 'after' }
		).lean()
	);
}

export async function respondToPetitionById(
	petitionId: PetitionId,
	responderId: UserId,
	response: string,
	answeredAt: string
): Promise<PetitionEntity | null> {
	return toPojo<PetitionEntity | null>(
		await PetitionModel.findOneAndUpdate(
			{
				_id: petitionId,
				status: PetitionStatus.Reviewing,
				responderId: null
			},
			{
				responderId,
				response,
				status: PetitionStatus.Answered,
				answeredAt
			},
			{ returnDocument: 'after' }
		).lean()
	);
}

export async function revisePetitionResponseById(
	petitionId: PetitionId,
	responderId: UserId,
	response: string,
	answeredAt: string
): Promise<PetitionEntity | null> {
	return toPojo<PetitionEntity | null>(
		await PetitionModel.findOneAndUpdate(
			{
				_id: petitionId,
				responderId: { $ne: null }
			},
			{
				response,
				responderId,
				answeredAt
			},
			{ returnDocument: 'after' }
		).lean()
	);
}

export async function deletePetitionResponseById(
	petitionId: PetitionId
): Promise<PetitionEntity | null> {
	return toPojo<PetitionEntity | null>(
		await PetitionModel.findOneAndUpdate(
			{
				_id: petitionId,
				responderId: { $ne: null }
			},
			{
				responderId: null,
				response: null,
				status: PetitionStatus.Reviewing,
				answeredAt: null
			},
			{ returnDocument: 'after' }
		).lean()
	);
}

export async function refreshPetitionStatusById(
	petitionId: PetitionId,
	currentStatus: PetitionStatus,
	signedBy: UserId[],
	nextStatus: PetitionStatus
): Promise<PetitionEntity | null> {
	return toPojo<PetitionEntity | null>(
		await PetitionModel.findOneAndUpdate(
			{
				_id: petitionId,
				status: currentStatus,
				signedBy
			},
			{ status: nextStatus },
			{ returnDocument: 'after' }
		).lean()
	);
}

export async function searchPetitionsByQuery(
	query: string,
	limit = 10,
	skip = 0
): Promise<Array<PetitionEntity & { searchScore?: number }>> {
	return toPojo<Array<PetitionEntity & { searchScore?: number }>>(
		await PetitionModel.find({ $text: { $search: query } }, { searchScore: { $meta: 'textScore' } })
			.sort({ searchScore: { $meta: 'textScore' }, createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean()
	);
}
