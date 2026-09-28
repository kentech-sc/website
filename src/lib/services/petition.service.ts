import type { Page } from '$lib/types/general.type.js';
import type {
	SubmissionCreate,
	SubmissionEntity,
	SubmissionId,
	SubmissionPreview
} from '$lib/types/submission.type.js';
import type { User } from '$lib/types/user.type.js';

import * as SubmissionResponseRepository from '$lib/repositories/submission-response.repository.js';
import * as SubmissionSupportRepository from '$lib/repositories/submission-support.repository.js';
import * as SubmissionRepository from '$lib/repositories/submission.repository.js';
import * as PetitionRule from '$lib/rules/petition.rule.js';
import { AppError, assertRule } from '$lib/server/errors.js';
import { assertUuid } from '$lib/server/id.js';
import { createPage } from '$lib/shared/paginate.js';
import { hasCapability } from '$lib/shared/permission.js';
import { APP_ERROR } from '$lib/shared/rule.js';
import { SubmissionKind } from '$lib/types/submission.type.js';

export function getPetitionPermissions(petition: SubmissionEntity, user: User) {
	return {
		canEdit: PetitionRule.canEditPetition(petition, user).ok,
		canDelete: PetitionRule.canDeletePetition(petition, user).ok,
		canSupport: PetitionRule.canSupportPetition(petition, user).ok,
		canCancelSupport: PetitionRule.canCancelPetitionSupport(petition, user).ok,
		canReview: PetitionRule.canReviewPetition(petition, user).ok,
		canCancelReview: PetitionRule.canCancelPetitionReview(petition, user).ok,
		canRespond: PetitionRule.canRespondToPetition(petition, user).ok,
		canEditResponse: PetitionRule.canReviseResponse(petition, user).ok,
		canDeleteResponse: PetitionRule.canDeleteResponse(petition, user).ok
	};
}

export async function editPetitionById(
	petitionId: SubmissionId,
	input: Pick<SubmissionEntity, 'title' | 'content'>,
	user: User
): Promise<SubmissionEntity> {
	const petition = await getPetitionById(petitionId);
	assertRule(PetitionRule.canEditPetition(petition, user));
	const updated = await SubmissionRepository.updateSubmissionWithoutSupportById(petitionId, input);
	if (!updated)
		throw new AppError(APP_ERROR.INVALID_STATE, '청원 상태가 변경되어 수정할 수 없습니다.');
	return updated;
}

export async function createPetition(
	petitionCreate: SubmissionCreate,
	user: User
): Promise<SubmissionEntity> {
	assertRule(PetitionRule.canCreatePetition(user));
	return await SubmissionRepository.createSubmission(petitionCreate);
}

export async function getPetitionById(petitionId: SubmissionId): Promise<SubmissionEntity> {
	assertUuid(petitionId, '존재하지 않는 청원입니다.');
	const petition = await SubmissionRepository.findSubmissionById(petitionId);
	if (!petition || petition.kind !== SubmissionKind.Petition) {
		throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 청원입니다.');
	}
	return await refreshStatusByPetition(petition);
}

export async function getPetitionPage(limit = 10, skip = 0): Promise<Page<SubmissionEntity>> {
	const [result, totalCount] = await Promise.all([
		SubmissionRepository.findRecentSubmissions([SubmissionKind.Petition], limit, skip),
		SubmissionRepository.countSubmissions([SubmissionKind.Petition])
	]);
	return createPage<SubmissionEntity>(result, totalCount, limit, skip);
}

export async function getPetitionPreviews(limit = 5): Promise<SubmissionPreview[]> {
	return await SubmissionRepository.findRecentSubmissionPreviews([SubmissionKind.Petition], limit);
}

export async function deletePetitionById(
	petitionId: SubmissionId,
	user: User
): Promise<SubmissionEntity> {
	const petition = await getPetitionById(petitionId);
	assertRule(PetitionRule.canDeletePetition(petition, user));

	const isDeleted = hasCapability(user, 'petition.delete.any')
		? await SubmissionRepository.deleteSubmissionById(petitionId)
		: await SubmissionRepository.deleteSubmissionWithoutSupportById(petitionId);
	if (!isDeleted) {
		throw new AppError(APP_ERROR.INVALID_STATE, '청원 상태가 변경되어 삭제할 수 없습니다.');
	}

	return petition;
}

export async function viewPetitionById(petitionId: SubmissionId): Promise<SubmissionEntity> {
	assertUuid(petitionId, '존재하지 않는 청원입니다.');
	const petition = await SubmissionRepository.viewSubmissionById(petitionId);
	if (!petition || petition.kind !== SubmissionKind.Petition) {
		throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 청원입니다.');
	}
	return await refreshStatusByPetition(petition);
}

export async function supportPetitionById(
	petitionId: SubmissionId,
	user: User
): Promise<SubmissionEntity> {
	const petition = await getPetitionById(petitionId);
	assertRule(PetitionRule.canSupportPetition(petition, user));

	const updatedPetition = await SubmissionSupportRepository.supportSubmissionById(
		petitionId,
		user.id
	);
	if (!updatedPetition) {
		throw new AppError(APP_ERROR.INVALID_STATE, '청원 상태가 변경되어 서명할 수 없습니다.');
	}

	return updatedPetition;
}

export async function cancelPetitionSupportById(
	petitionId: SubmissionId,
	user: User
): Promise<SubmissionEntity> {
	const petition = await getPetitionById(petitionId);
	assertRule(PetitionRule.canCancelPetitionSupport(petition, user));

	const updatedPetition = await SubmissionSupportRepository.cancelSubmissionSupportById(
		petitionId,
		user.id
	);
	if (!updatedPetition) {
		throw new AppError(APP_ERROR.INVALID_STATE, '청원 상태가 변경되어 서명을 취소할 수 없습니다.');
	}

	return updatedPetition;
}

export async function startPetitionReviewById(
	petitionId: SubmissionId,
	user: User
): Promise<SubmissionEntity> {
	const petition = await getPetitionById(petitionId);
	assertRule(PetitionRule.canReviewPetition(petition, user));

	const updatedPetition = await SubmissionResponseRepository.updateSubmissionStatusById(
		petitionId,
		'pending',
		'reviewing'
	);
	if (!updatedPetition) {
		throw new AppError(APP_ERROR.INVALID_STATE, '청원 상태가 변경되어 검토할 수 없습니다.');
	}

	return updatedPetition;
}

export async function cancelPetitionReviewById(
	petitionId: SubmissionId,
	user: User
): Promise<SubmissionEntity> {
	const petition = await getPetitionById(petitionId);
	assertRule(PetitionRule.canCancelPetitionReview(petition, user));

	const updatedPetition = await SubmissionResponseRepository.updateSubmissionStatusById(
		petitionId,
		'reviewing',
		'pending'
	);
	if (!updatedPetition) {
		throw new AppError(APP_ERROR.INVALID_STATE, '청원 상태가 변경되어 검토를 취소할 수 없습니다.');
	}

	return updatedPetition;
}

export async function respondToPetitionById(
	petitionId: SubmissionId,
	responder: User,
	response: string
): Promise<SubmissionEntity> {
	const petition = await getPetitionById(petitionId);
	assertRule(PetitionRule.canRespondToPetition(petition, responder));

	const updatedPetition = await SubmissionResponseRepository.respondToSubmissionById(
		petitionId,
		responder.id,
		response,
		new Date().toISOString()
	);
	if (!updatedPetition) {
		throw new AppError(APP_ERROR.INVALID_STATE, '청원 상태가 변경되어 응답할 수 없습니다.');
	}

	return updatedPetition;
}

export async function updatePetitionResponseById(
	petitionId: SubmissionId,
	responder: User,
	response: string
): Promise<SubmissionEntity> {
	const petition = await getPetitionById(petitionId);
	assertRule(PetitionRule.canReviseResponse(petition, responder));

	const updatedPetition = await SubmissionResponseRepository.reviseSubmissionResponseById(
		petitionId,
		responder.id,
		response,
		new Date().toISOString()
	);
	if (!updatedPetition) {
		throw new AppError(APP_ERROR.INVALID_STATE, '청원 상태가 변경되어 응답을 수정할 수 없습니다.');
	}

	return updatedPetition;
}

export async function deleteResponseById(
	petitionId: SubmissionId,
	responder: User
): Promise<SubmissionEntity> {
	const petition = await getPetitionById(petitionId);
	assertRule(PetitionRule.canDeleteResponse(petition, responder));

	const updatedPetition =
		await SubmissionResponseRepository.deleteSubmissionResponseById(petitionId);
	if (!updatedPetition) {
		throw new AppError(APP_ERROR.INVALID_STATE, '청원 상태가 변경되어 응답을 삭제할 수 없습니다.');
	}

	return updatedPetition;
}

async function refreshStatusByPetition(petition: SubmissionEntity): Promise<SubmissionEntity> {
	const nextStatus = PetitionRule.getNextStatus(petition);
	if (nextStatus === petition.status) return petition;

	const refreshedPetition = await SubmissionSupportRepository.refreshSubmissionStatusById(
		petition.id,
		petition.status,
		petition.supporterIds.length,
		nextStatus
	);
	if (refreshedPetition) return refreshedPetition;

	const latestPetition = await SubmissionRepository.findSubmissionById(petition.id);
	if (!latestPetition) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 청원입니다.');
	return latestPetition;
}

export async function searchPetitionsByQuery(
	query: string,
	limit = 10,
	skip = 0
): Promise<Array<SubmissionEntity & { searchScore?: number }>> {
	return await SubmissionRepository.searchSubmissionsByQuery(
		query,
		[SubmissionKind.Petition],
		limit,
		skip
	);
}

export async function countPetitionsByQuery(query: string): Promise<number> {
	return await SubmissionRepository.countSubmissionsByQuery(query, [SubmissionKind.Petition]);
}
