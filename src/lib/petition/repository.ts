import type { UserId } from '$lib/user/types';
import { PetitionModel } from './model';
import type { PetitionCreate, Petition, PetitionId, PetitionUpdate } from './types';
import { paginateModel } from '$lib/general/paginate';

export class PetitionRepository {
	static async createPetition(petition: PetitionCreate): Promise<Petition> {
		return (await PetitionModel.create(petition)).toObject();
	}

	static async getPetitionById(petitionId: PetitionId): Promise<Petition | null> {
		return await PetitionModel.findOne({ _id: petitionId }).lean();
	}

	static async getPetitions(
		limit = 10,
		{ fromId, toId }: { fromId?: PetitionId; toId?: PetitionId } = {}
	): Promise<{ pageItems: Petition[]; fromId?: PetitionId; toId?: PetitionId }> {
		return await paginateModel(PetitionModel, {}, limit, { fromId, toId });
	}

	static async updatePetitionById(
		petitionId: PetitionId,
		petition: PetitionUpdate
	): Promise<Petition | null> {
		return await PetitionModel.findOneAndUpdate({ _id: petitionId }, petition, {
			new: true
		}).lean();
	}

	static async deletePetitionById(petitionId: PetitionId): Promise<Petition | null> {
		return await PetitionModel.findOneAndDelete({ _id: petitionId }).lean();
	}

	static async viewPetitionById(petitionId: PetitionId): Promise<Petition | null> {
		return await PetitionModel.findOneAndUpdate(
			{ _id: petitionId },
			{ $inc: { viewCnt: 1 } },
			{ new: true }
		).lean();
	}

	static async deleteAllPetitions(): Promise<void> {
		await PetitionModel.deleteMany();
	}

	static async signPetitionById(petitionId: PetitionId, userId: UserId): Promise<Petition> {
		return await PetitionModel.findOneAndUpdate(
			{ _id: petitionId, signedBy: { $ne: userId }, petitionerId: { $ne: userId } },
			{ $push: { signedBy: userId }, $inc: { signCnt: 1 } },
			{ new: true }
		).lean();
	}

	static async unsignPetitionById(petitionId: PetitionId, userId: UserId): Promise<Petition> {
		return await PetitionModel.findOneAndUpdate(
			{ _id: petitionId, signedBy: userId },
			{ $pull: { signedBy: userId }, $inc: { signCnt: -1 } },
			{ new: true }
		).lean();
	}
}
