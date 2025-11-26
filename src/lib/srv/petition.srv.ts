import type { User, UserId } from '$lib/types/user.type.js';
import type {
	Petition,
	PetitionCreate,
	PetitionId,
	PetitionUpdate
} from '$lib/types/petition.type.js';

import { UserGroup } from '$lib/types/user.type.js';
import { PetitionStatus } from '$lib/types/petition.type.js';

import * as PetitionRepository from '$lib/repo/petition.repo.js';

export const translatedStatus: Record<PetitionStatus, string> = {
	ongoing: '진행 중',
	pending: '검토 대기',
	reviewing: '검토 중',
	answered: '답변 완료',
	expired: '기간 만료'
};

export const colorStatus: Record<PetitionStatus, string> = {
	ongoing: 'blue',
	pending: 'orange',
	reviewing: 'red',
	answered: 'green',
	expired: 'gray'
};

export async function getPetitionById(petitionId: PetitionId): Promise<Petition> {
	const petition = await PetitionRepository.getPetitionById(petitionId);
	if (!petition) throw new Error('존재하지 않는 청원입니다.');
	return await refreshStatusByPetition(petition);
}

export async function getPetitions(
	limit = 10,
	{ fromId, toId }: { fromId?: PetitionId; toId?: PetitionId } = {}
): Promise<{ pageItems: Petition[]; fromId?: PetitionId; toId?: PetitionId }> {
	return await PetitionRepository.getPetitions(limit, { fromId, toId });
}

export async function createPetition(
	title: string,
	content: string,
	userId: UserId
): Promise<Petition> {
	const petition: PetitionCreate = {
		title,
		content,
		petitionerId: userId,
		viewCnt: 0,
		signCnt: 0,
		signedBy: [],
		status: PetitionStatus.Ongoing
	};
	return await PetitionRepository.createPetition(petition);
}

export async function updatePetitionById(
	petitionId: PetitionId,
	petition: PetitionUpdate
): Promise<Petition> {
	const updatedPetition = await PetitionRepository.updatePetitionById(petitionId, petition);
	if (!updatedPetition) throw new Error('존재하지 않는 청원입니다.');
	return updatedPetition;
}

export function canDeletePetition(petition: Petition, user: User): boolean {
	return petition.petitionerId.equals(user._id) || user.group === UserGroup.Manager;
}

export async function deletePetitionById(
	petitionId: PetitionId,
	user: User
): Promise<Petition | null> {
	const petition = await getPetitionById(petitionId);
	if (!canDeletePetition(petition, user)) throw new Error('삭제할 권한이 없습니다.');
	const deletedPetition = await PetitionRepository.deletePetitionById(petitionId);
	if (!deletedPetition) throw new Error('존재하지 않는 청원입니다.');
	return deletedPetition;
}

export async function viewPetitionById(petitionId: PetitionId): Promise<Petition> {
	const petition = await PetitionRepository.viewPetitionById(petitionId);
	if (!petition) throw new Error('존재하지 않는 청원입니다.');
	return petition;
}

export async function signPetitionById(petitionId: PetitionId, userId: UserId): Promise<Petition> {
	const updatedPetition = await PetitionRepository.signPetitionById(petitionId, userId);
	if (!updatedPetition)
		throw new Error('존재하지 않는 청원이거나, 이미 답변되거나 만료된 청원입니다.');
	return updatedPetition;
}

export async function unsignPetitionById(
	petitionId: PetitionId,
	userId: UserId
): Promise<Petition> {
	const updatedPetition = await PetitionRepository.unsignPetitionById(petitionId, userId);
	if (!updatedPetition)
		throw new Error('존재하지 않는 청원이거나, 이미 답변되거나 만료된 청원입니다.');
	return updatedPetition;
}

export function canManagePetition(user: User): boolean {
	return user.group === UserGroup.Manager;
}

export async function reviewPetitionById(petitionId: PetitionId, user: User): Promise<Petition> {
	const petition = await getPetitionById(petitionId);
	if (!canManagePetition(user)) throw new Error('검토할 권한이 없습니다.');
	if (petition.status === 'reviewing') throw new Error('이미 검토 중인 청원입니다.');
	return await updatePetitionById(petitionId, { status: PetitionStatus.Reviewing });
}

export async function unreviewPetitionById(petitionId: PetitionId, user: User): Promise<Petition> {
	const petition = await getPetitionById(petitionId);
	if (!canManagePetition(user)) throw new Error('검토 취소할 권한이 없습니다.');
	if (petition.status !== 'reviewing') throw new Error('아직 검토 중이지 않은 청원입니다.');
	return await updatePetitionById(petitionId, { status: 'pending' });
}

export async function responseToPetitionById(
	petitionId: PetitionId,
	responder: User,
	response: string
): Promise<Petition> {
	const petition = await getPetitionById(petitionId);
	if (!canManagePetition(responder)) throw new Error('답변할 권한이 없습니다.');
	if (petition.responderId) throw new Error('이미 답변된 청원입니다.');
	return await updatePetitionById(petitionId, {
		responderId: responder._id,
		response,
		status: 'answered',
		answeredAt: new Date()
	});
}

export async function reviseResponseById(
	petitionId: PetitionId,
	responder: User,
	response: string
): Promise<Petition> {
	const petition = await getPetitionById(petitionId);
	if (!petition.responderId) throw new Error('답변이 없는 청원입니다.');
	if (!canManagePetition(responder)) throw new Error('답변을 수정할 권한이 없습니다.');
	return await updatePetitionById(petitionId, {
		response,
		responderId: responder._id,
		answeredAt: new Date()
	});
}

export async function deleteResponseById(
	petitionId: PetitionId,
	responder: User
): Promise<Petition> {
	const petition = await getPetitionById(petitionId);
	if (!petition.responderId) throw new Error('답변이 없는 청원입니다.');
	if (!canManagePetition(responder)) throw new Error('답변을 삭제할 권한이 없습니다.');
	return await updatePetitionById(petitionId, {
		responderId: null,
		response: null,
		status: 'reviewing',
		answeredAt: null
	});
}

export async function refreshStatusByPetition(petition: Petition): Promise<Petition> {
	if (petition.status === 'ongoing') {
		if (petition.signCnt >= 30) {
			return await updatePetitionById(petition._id, { status: 'pending' });
		} else if (petition.createdAt < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)) {
			return await updatePetitionById(petition._id, { status: 'expired' });
		}
	}
	return petition;
}

export async function searchPetitionByQuery(
	query: string,
	page = 1,
	limit = 10
): Promise<{ items: Petition[]; more: boolean }> {
	const petitions = await PetitionRepository.searchPetitionByQuery(query, page, limit);
	return { items: petitions.slice(0, limit), more: petitions.length > limit };
}
