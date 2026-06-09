import type { Page } from '$lib/types/general.type.js';
import {
	PetitionStatus,
	type Petition,
	type PetitionCreate,
	type PetitionEntity,
	type PetitionId,
	type PetitionUpdate
} from '$lib/types/petition.type.js';
import type { User } from '$lib/types/user.type.js';

import { createPage } from '$lib/shared/paginate.js';
import { APP_ERROR } from '$lib/shared/rule.js';
import { AppError, assertRule } from '$lib/server/errors.js';

import * as PetitionRepository from '$lib/repositories/petition.repository.js';
import * as PetitionRule from '$lib/rules/petition.rule.js';

function toPetition(petitionEntity: PetitionEntity): Petition {
	return {
		...petitionEntity,
		signCnt: petitionEntity.signedBy.length,
		petitionerName: null,
		responderName: null
	};
}

export function getPetitionPermissions(petition: Petition, user: User) {
	return {
		canDelete: PetitionRule.canDeletePetition(petition, user).ok,
		canSign: PetitionRule.canSignPetition(petition, user).ok,
		canUnsign: PetitionRule.canUnsignPetition(petition, user).ok,
		canReview: PetitionRule.canReviewPetition(petition, user).ok,
		canUnreview: PetitionRule.canUnreviewPetition(petition, user).ok,
		canRespond: PetitionRule.canRespondToPetition(petition, user).ok,
		canEditResponse: PetitionRule.canReviseResponse(petition, user).ok,
		canDeleteResponse: PetitionRule.canDeleteResponse(petition, user).ok
	};
}

export async function createPetition(
	petitionCreate: PetitionCreate,
	user: User
): Promise<Petition> {
	assertRule(PetitionRule.canCreatePetition(user));
	return toPetition(await PetitionRepository.createPetition(petitionCreate));
}

export async function getPetitionById(petitionId: PetitionId): Promise<Petition> {
	const doc = await PetitionRepository.findPetitionById(petitionId);
	if (!doc) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 청원입니다.');
	return await refreshStatusByPetition(toPetition(doc));
}

export async function getPetitionPage(limit = 10, skip = 0): Promise<Page<Petition>> {
	const [result, totalCount] = await Promise.all([
		PetitionRepository.findRecentPetitions(limit, skip),
		PetitionRepository.countPetitions()
	]);
	return createPage<Petition>(result.map(toPetition), totalCount, limit, skip);
}

export async function updatePetitionById(
	petitionId: PetitionId,
	petition: PetitionUpdate
): Promise<Petition> {
	const updatedPetition = await PetitionRepository.updatePetitionById(petitionId, petition);
	if (!updatedPetition) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 청원입니다.');
	return toPetition(updatedPetition);
}

export async function deletePetitionById(petitionId: PetitionId, user: User): Promise<Petition> {
	const petition = await getPetitionById(petitionId);
	assertRule(PetitionRule.canDeletePetition(petition, user));

	const isDeleted = await PetitionRepository.deletePetitionById(petitionId);
	if (!isDeleted) throw new AppError(APP_ERROR.NOT_FOUND, '이미 삭제된 청원입니다.');

	return petition;
}

export async function viewPetitionById(petitionId: PetitionId): Promise<Petition> {
	const petition = await PetitionRepository.viewPetitionById(petitionId);
	if (!petition) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 청원입니다.');
	return toPetition(petition);
}

export async function signPetitionById(petitionId: PetitionId, user: User): Promise<Petition> {
	const petition = await getPetitionById(petitionId);
	assertRule(PetitionRule.canSignPetition(petition, user));

	const updatedPetition = await PetitionRepository.signPetitionById(petitionId, user._id);
	if (!updatedPetition) {
		throw new AppError(APP_ERROR.INVALID_STATE, '청원 상태가 변경되어 서명할 수 없습니다.');
	}

	return toPetition(updatedPetition);
}

export async function unsignPetitionById(petitionId: PetitionId, user: User): Promise<Petition> {
	const petition = await getPetitionById(petitionId);
	assertRule(PetitionRule.canUnsignPetition(petition, user));

	const updatedPetition = await PetitionRepository.unsignPetitionById(petitionId, user._id);
	if (!updatedPetition) {
		throw new AppError(APP_ERROR.INVALID_STATE, '청원 상태가 변경되어 서명을 취소할 수 없습니다.');
	}

	return toPetition(updatedPetition);
}

export async function reviewPetitionById(petitionId: PetitionId, user: User): Promise<Petition> {
	const petition = await getPetitionById(petitionId);
	assertRule(PetitionRule.canReviewPetition(petition, user));

	return toPetition(await updatePetitionById(petitionId, { status: PetitionStatus.Reviewing }));
}

export async function unreviewPetitionById(petitionId: PetitionId, user: User): Promise<Petition> {
	const petition = await getPetitionById(petitionId);
	assertRule(PetitionRule.canUnreviewPetition(petition, user));

	return toPetition(await updatePetitionById(petitionId, { status: PetitionStatus.Pending }));
}

export async function responseToPetitionById(
	petitionId: PetitionId,
	responder: User,
	response: string
): Promise<Petition> {
	const petition = await getPetitionById(petitionId);
	assertRule(PetitionRule.canRespondToPetition(petition, responder));

	return await updatePetitionById(petitionId, {
		responderId: responder._id,
		response,
		status: PetitionStatus.Answered,
		answeredAt: new Date().toISOString()
	});
}

export async function reviseResponseById(
	petitionId: PetitionId,
	responder: User,
	response: string
): Promise<Petition> {
	const petition = await getPetitionById(petitionId);
	assertRule(PetitionRule.canReviseResponse(petition, responder));

	return await updatePetitionById(petitionId, {
		response,
		responderId: responder._id,
		answeredAt: new Date().toISOString()
	});
}

export async function deleteResponseById(
	petitionId: PetitionId,
	responder: User
): Promise<Petition> {
	const petition = await getPetitionById(petitionId);
	assertRule(PetitionRule.canDeleteResponse(petition, responder));

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
	}

	return petition;
}

export async function searchPetitionsByQuery(
	query: string,
	page = 1,
	limit = 10
): Promise<{ items: Petition[]; more: boolean }> {
	const { items, more } = await PetitionRepository.searchPetitionsByQuery(query, page, limit);
	return { items: items.map(toPetition), more };
}
