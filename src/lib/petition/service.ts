import type { UserId } from '$lib/user/types';
import { PetitionRepository } from './repository';
import type { Petition, PetitionCreate, PetitionId, PetitionUpdate } from './types';

export default class PetitionService {
	static translatedStatus = {
		ongoing: '진행 중',
		pending: '검토 대기',
		reviewing: '검토 중',
		answered: '답변 완료',
		expired: '기간 만료'
	};

	static colorStatus = {
		ongoing: 'blue',
		pending: 'orange',
		reviewing: 'red',
		answered: 'green',
		expired: 'gray'
	};

	static async getPetitionById(petitionId: PetitionId): Promise<Petition> {
		const petition = await PetitionRepository.getPetitionById(petitionId);
		if (!petition) throw new Error('존재하지 않는 청원입니다.');
		return petition;
	}

	static async getAllPetitions(): Promise<Petition[]> {
		const petitions = await PetitionRepository.getAllPetitions();
		return Promise.all(petitions.map((petition) => this.refreshStatusByPetition(petition)));
	}

	static async createPetition(title: string, content: string, userId: UserId): Promise<Petition> {
		const petition: PetitionCreate = {
			title,
			content,
			petitionerId: userId,
			viewCnt: 0,
			signCnt: 0,
			signedBy: [],
			status: 'ongoing'
		};
		return await PetitionRepository.createPetition(petition);
	}

	static async updatePetitionById(
		petitionId: PetitionId,
		petition: PetitionUpdate
	): Promise<Petition> {
		const updatedPetition = await PetitionRepository.updatePetitionById(petitionId, petition);
		if (!updatedPetition) throw new Error('존재하지 않는 청원입니다.');
		return updatedPetition;
	}

	static async deletePetitionById(
		petitionId: PetitionId,
		userId: UserId
	): Promise<Petition | null> {
		const deletedPetition = await PetitionRepository.deletePetitionById(petitionId);
		if (!deletedPetition) throw new Error('존재하지 않는 청원입니다.');
		if (deletedPetition.petitionerId.toString() !== userId.toString())
			throw new Error('청원을 삭제할 권한이 없습니다.');
		return deletedPetition;
	}

	static async viewPetitionById(petitionId: PetitionId): Promise<Petition> {
		const petition = await PetitionRepository.viewPetitionById(petitionId);
		if (!petition) throw new Error('존재하지 않는 청원입니다.');
		return petition;
	}

	static async signPetitionById(petitionId: PetitionId, userId: UserId): Promise<Petition> {
		return await PetitionRepository.signPetitionById(petitionId, userId);
	}

	static async unsignPetitionById(petitionId: PetitionId, userId: UserId): Promise<Petition> {
		return await PetitionRepository.unsignPetitionById(petitionId, userId);
	}

	static async reviewPetitionById(petitionId: PetitionId, _userId: UserId): Promise<Petition> {
		const petition = await this.getPetitionById(petitionId);
		if (petition.status === 'reviewing') throw new Error('이미 검토 중인 청원입니다.');
		return await this.updatePetitionById(petitionId, { status: 'reviewing' });
	}

	static async responseToPetitionById(
		petitionId: PetitionId,
		responderId: UserId,
		response: string
	): Promise<Petition> {
		const petition = await this.getPetitionById(petitionId);
		if (petition.responderId) throw new Error('이미 답변된 청원입니다.');
		return await this.updatePetitionById(petitionId, {
			responderId,
			response,
			status: 'answered',
			answeredAt: new Date()
		});
	}

	static async deleteResponseById(petitionId: PetitionId, responderId: UserId): Promise<Petition> {
		const petition = await this.getPetitionById(petitionId);
		if (!petition.responderId) throw new Error('답변이 없는 청원입니다.');
		if (petition.responderId.toString() !== responderId.toString())
			throw new Error('답변을 삭제할 권한이 없습니다.');
		return await this.updatePetitionById(petitionId, {
			responderId: null,
			response: null,
			status: 'pending',
			answeredAt: null
		});
	}

	static async refreshStatusByPetition(petition: Petition): Promise<Petition> {
		if (petition.status === 'ongoing') {
			if (petition.signCnt >= 30) {
				return await this.updatePetitionById(petition._id, { status: 'pending' });
			} else if (petition.createdAt < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
				return await this.updatePetitionById(petition._id, { status: 'expired' });
			}
		}
		return petition;
	}
}
