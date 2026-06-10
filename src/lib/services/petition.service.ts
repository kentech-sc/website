import type { Page } from '$lib/types/general.type.js';
import type { User } from '$lib/types/user.type.js';

import * as PetitionRepository from '$lib/repositories/petition.repository.js';
import * as PetitionRule from '$lib/rules/petition.rule.js';
import { AppError, assertRule } from '$lib/server/errors.js';
import { createPage } from '$lib/shared/paginate.js';
import { APP_ERROR } from '$lib/shared/rule.js';
import {
	type PetitionCreate,
	type PetitionEntity,
	type PetitionId
} from '$lib/types/petition.type.js';

export function getPetitionPermissions(petition: PetitionEntity, user: User) {
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
): Promise<PetitionEntity> {
	assertRule(PetitionRule.canCreatePetition(user));
	return await PetitionRepository.createPetition(petitionCreate);
}

export async function getPetitionById(petitionId: PetitionId): Promise<PetitionEntity> {
	const petition = await PetitionRepository.findPetitionById(petitionId);
	if (!petition) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 청원입니다.');
	return await refreshStatusByPetition(petition);
}

export async function getPetitionPage(limit = 10, skip = 0): Promise<Page<PetitionEntity>> {
	const [result, totalCount] = await Promise.all([
		PetitionRepository.findRecentPetitions(limit, skip),
		PetitionRepository.countPetitions()
	]);
	return createPage<PetitionEntity>(result, totalCount, limit, skip);
}

export async function deletePetitionById(
	petitionId: PetitionId,
	user: User
): Promise<PetitionEntity> {
	const petition = await getPetitionById(petitionId);
	assertRule(PetitionRule.canDeletePetition(petition, user));

	const isDeleted = await PetitionRepository.deletePetitionById(petitionId);
	if (!isDeleted) throw new AppError(APP_ERROR.NOT_FOUND, '이미 삭제된 청원입니다.');

	return petition;
}

export async function viewPetitionById(petitionId: PetitionId): Promise<PetitionEntity> {
	const petition = await PetitionRepository.viewPetitionById(petitionId);
	if (!petition) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 청원입니다.');
	return await refreshStatusByPetition(petition);
}

export async function signPetitionById(
	petitionId: PetitionId,
	user: User
): Promise<PetitionEntity> {
	const petition = await getPetitionById(petitionId);
	assertRule(PetitionRule.canSignPetition(petition, user));

	const updatedPetition = await PetitionRepository.signPetitionById(petitionId, user._id);
	if (!updatedPetition) {
		throw new AppError(APP_ERROR.INVALID_STATE, '청원 상태가 변경되어 서명할 수 없습니다.');
	}

	return updatedPetition;
}

export async function unsignPetitionById(
	petitionId: PetitionId,
	user: User
): Promise<PetitionEntity> {
	const petition = await getPetitionById(petitionId);
	assertRule(PetitionRule.canUnsignPetition(petition, user));

	const updatedPetition = await PetitionRepository.unsignPetitionById(petitionId, user._id);
	if (!updatedPetition) {
		throw new AppError(APP_ERROR.INVALID_STATE, '청원 상태가 변경되어 서명을 취소할 수 없습니다.');
	}

	return updatedPetition;
}

export async function reviewPetitionById(
	petitionId: PetitionId,
	user: User
): Promise<PetitionEntity> {
	const petition = await getPetitionById(petitionId);
	assertRule(PetitionRule.canReviewPetition(petition, user));

	const updatedPetition = await PetitionRepository.reviewPetitionById(petitionId);
	if (!updatedPetition) {
		throw new AppError(APP_ERROR.INVALID_STATE, '청원 상태가 변경되어 검토할 수 없습니다.');
	}

	return updatedPetition;
}

export async function unreviewPetitionById(
	petitionId: PetitionId,
	user: User
): Promise<PetitionEntity> {
	const petition = await getPetitionById(petitionId);
	assertRule(PetitionRule.canUnreviewPetition(petition, user));

	const updatedPetition = await PetitionRepository.unreviewPetitionById(petitionId);
	if (!updatedPetition) {
		throw new AppError(APP_ERROR.INVALID_STATE, '청원 상태가 변경되어 검토를 취소할 수 없습니다.');
	}

	return updatedPetition;
}

export async function responseToPetitionById(
	petitionId: PetitionId,
	responder: User,
	response: string
): Promise<PetitionEntity> {
	const petition = await getPetitionById(petitionId);
	assertRule(PetitionRule.canRespondToPetition(petition, responder));

	const updatedPetition = await PetitionRepository.respondToPetitionById(
		petitionId,
		responder._id,
		response,
		new Date().toISOString()
	);
	if (!updatedPetition) {
		throw new AppError(APP_ERROR.INVALID_STATE, '청원 상태가 변경되어 응답할 수 없습니다.');
	}

	return updatedPetition;
}

export async function reviseResponseById(
	petitionId: PetitionId,
	responder: User,
	response: string
): Promise<PetitionEntity> {
	const petition = await getPetitionById(petitionId);
	assertRule(PetitionRule.canReviseResponse(petition, responder));

	const updatedPetition = await PetitionRepository.revisePetitionResponseById(
		petitionId,
		responder._id,
		response,
		new Date().toISOString()
	);
	if (!updatedPetition) {
		throw new AppError(APP_ERROR.INVALID_STATE, '청원 상태가 변경되어 응답을 수정할 수 없습니다.');
	}

	return updatedPetition;
}

export async function deleteResponseById(
	petitionId: PetitionId,
	responder: User
): Promise<PetitionEntity> {
	const petition = await getPetitionById(petitionId);
	assertRule(PetitionRule.canDeleteResponse(petition, responder));

	const updatedPetition = await PetitionRepository.deletePetitionResponseById(petitionId);
	if (!updatedPetition) {
		throw new AppError(APP_ERROR.INVALID_STATE, '청원 상태가 변경되어 응답을 삭제할 수 없습니다.');
	}

	return updatedPetition;
}

async function refreshStatusByPetition(petition: PetitionEntity): Promise<PetitionEntity> {
	const nextStatus = PetitionRule.getNextStatus(petition);
	if (nextStatus === petition.status) return petition;

	const refreshedPetition = await PetitionRepository.refreshPetitionStatusById(
		petition._id,
		petition.status,
		petition.signedBy,
		nextStatus
	);
	if (refreshedPetition) return refreshedPetition;

	const latestPetition = await PetitionRepository.findPetitionById(petition._id);
	if (!latestPetition) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 청원입니다.');
	return latestPetition;
}

export async function searchPetitionsByQuery(
	query: string,
	page = 1,
	limit = 10
): Promise<{ items: PetitionEntity[]; more: boolean }> {
	return await PetitionRepository.searchPetitionsByQuery(query, page, limit);
}
