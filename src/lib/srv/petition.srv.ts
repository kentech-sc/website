import type { User, UserId } from '$lib/types/user.type.js';
import type {
	Petition,
	PetitionCreate,
	PetitionDoc,
	PetitionId,
	PetitionUpdate
} from '$lib/types/petition.type.js';

import { PetitionStatus } from '$lib/types/petition.type.js';

import { RuleError, SrvError } from '$lib/common/errors.js';

import * as PetitionRepository from '$lib/repo/petition.repo.js';
import * as PetitionRule from '$lib/rules/petition.rule.js';

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

function toPetition(petitionDoc: PetitionDoc): Petition {
	const petition = {
		...petitionDoc,
		signCnt: petitionDoc.signedBy.length,
		petitionerName: null,
		responderName: null
	};
	return petition;
}

export async function createPetition(petitionCreate: PetitionCreate): Promise<Petition> {
	return toPetition(await PetitionRepository.createPetition(petitionCreate));
}

export async function getPetitionById(petitionId: PetitionId): Promise<Petition> {
	const doc = await PetitionRepository.getPetitionById(petitionId);
	if (!doc) throw new SrvError('존재하지 않는 청원입니다.');
	const petition = toPetition(doc);
	return await refreshStatusByPetition(petition);
}

export async function getPetitions(
	limit = 10,
	{ fromId, toId }: { fromId?: PetitionId; toId?: PetitionId } = {}
): Promise<{ pageItems: Petition[]; fromId?: PetitionId; toId?: PetitionId }> {
	const result = await PetitionRepository.getPetitions(limit, { fromId, toId });
	return {
		...result,
		pageItems: result.pageItems.map(toPetition)
	};
}

export async function updatePetitionById(
	petitionId: PetitionId,
	petition: PetitionUpdate
): Promise<Petition> {
	const updatedPetition = await PetitionRepository.updatePetitionById(petitionId, petition);
	if (!updatedPetition) throw new SrvError('존재하지 않는 청원입니다.');
	return toPetition(updatedPetition);
}

export async function deletePetitionById(petitionId: PetitionId, user: User): Promise<Petition> {
	const petition = await getPetitionById(petitionId);

	if (!PetitionRule.canDeletePetition(petition, user))
		throw new RuleError('삭제할 권한이 없습니다.');

	const isDeleted = await PetitionRepository.deletePetitionById(petitionId);
	if (!isDeleted) throw new SrvError('이미 삭제된 청원입니다.');

	return petition;
}

export async function viewPetitionById(petitionId: PetitionId): Promise<Petition> {
	const petition = await PetitionRepository.viewPetitionById(petitionId);
	if (!petition) throw new SrvError('존재하지 않는 청원입니다.');
	return toPetition(petition);
}

export async function signPetitionById(petitionId: PetitionId, userId: UserId): Promise<Petition> {
	const updatedPetition = await PetitionRepository.signPetitionById(petitionId, userId);
	if (!updatedPetition)
		throw new SrvError('존재하지 않는 청원이거나, 이미 답변되거나 만료된 청원입니다.');
	return toPetition(updatedPetition);
}

export async function unsignPetitionById(
	petitionId: PetitionId,
	userId: UserId
): Promise<Petition> {
	const updatedPetition = await PetitionRepository.unsignPetitionById(petitionId, userId);
	if (!updatedPetition)
		throw new SrvError('존재하지 않는 청원이거나, 이미 답변되거나 만료된 청원입니다.');
	return toPetition(updatedPetition);
}

export async function reviewPetitionById(petitionId: PetitionId, user: User): Promise<Petition> {
	const petition = await getPetitionById(petitionId);

	if (!PetitionRule.canManagePetition(user)) throw new RuleError('검토할 권한이 없습니다.');
	if (petition.status === 'reviewing') throw new RuleError('이미 검토 중인 청원입니다.');

	return toPetition(await updatePetitionById(petitionId, { status: PetitionStatus.Reviewing }));
}

export async function unreviewPetitionById(petitionId: PetitionId, user: User): Promise<Petition> {
	const petition = await getPetitionById(petitionId);

	if (!PetitionRule.canManagePetition(user)) throw new RuleError('검토 취소할 권한이 없습니다.');
	if (petition.status !== 'reviewing') throw new RuleError('아직 검토 중이지 않은 청원입니다.');

	return toPetition(await updatePetitionById(petitionId, { status: PetitionStatus.Pending }));
}

export async function responseToPetitionById(
	petitionId: PetitionId,
	responder: User,
	response: string
): Promise<Petition> {
	const petition = await getPetitionById(petitionId);

	if (!PetitionRule.canManagePetition(responder)) throw new RuleError('답변할 권한이 없습니다.');
	if (PetitionRule.hasResponse(petition)) throw new RuleError('이미 답변된 청원입니다.');

	return await updatePetitionById(petitionId, {
		responderId: responder._id,
		response,
		status: PetitionStatus.Answered,
		answeredAt: new Date()
	});
}

export async function reviseResponseById(
	petitionId: PetitionId,
	responder: User,
	response: string
): Promise<Petition> {
	const petition = await getPetitionById(petitionId);

	if (!PetitionRule.hasResponse(petition)) throw new SrvError('답변이 없는 청원입니다.');
	if (!PetitionRule.canManagePetition(responder))
		throw new RuleError('답변을 수정할 권한이 없습니다.');

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

	if (!PetitionRule.hasResponse(petition)) throw new SrvError('답변이 없는 청원입니다.');
	if (!PetitionRule.canManagePetition(responder))
		throw new RuleError('답변을 삭제할 권한이 없습니다.');

	return await updatePetitionById(petitionId, {
		responderId: null,
		response: null,
		status: PetitionStatus.Reviewing,
		answeredAt: null
	});
}

export async function refreshStatusByPetition(petition: Petition): Promise<Petition> {
	const nextStatus = PetitionRule.getNextStatus(petition);
	if (nextStatus !== petition.status) {
		return await updatePetitionById(petition._id, { status: nextStatus });
	} else {
		return petition;
	}
}

export async function searchPetitionsByQuery(
	query: string,
	page = 1,
	limit = 10
): Promise<{ items: Petition[]; more: boolean }> {
	const { items, more } = await PetitionRepository.searchPetitionsByQuery(query, page, limit);
	return { items: items.map(toPetition), more };
}
