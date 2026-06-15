import type { User } from '$lib/types/user.type.js';

import { hasCapability, isOwner } from '$lib/shared/permission.js';
import { APP_ERROR, ok, ruleFail, type RuleResult } from '$lib/shared/rule.js';
import { PetitionStatus, type PetitionEntity } from '$lib/types/petition.type.js';

export function canCreatePetition(user: User): RuleResult {
	if (hasCapability(user, 'petition.write')) return ok();
	return ruleFail(APP_ERROR.FORBIDDEN, '청원을 작성할 권한이 없습니다.');
}

export function canDeletePetition(petition: PetitionEntity, user: User): RuleResult {
	if (isOwner(user, petition.petitionerId) || hasCapability(user, 'petition.delete.any')) {
		return ok();
	}

	return ruleFail(APP_ERROR.FORBIDDEN, '청원을 삭제할 권한이 없습니다.');
}

export function canSignPetition(petition: PetitionEntity, user: User): RuleResult {
	if (!hasCapability(user, 'petition.sign')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '청원에 서명할 권한이 없습니다.');
	}

	if (isOwner(user, petition.petitionerId)) {
		return ruleFail(APP_ERROR.INVALID_STATE, '본인 청원에는 서명할 수 없습니다.');
	}

	if (petition.status === PetitionStatus.Answered || petition.status === PetitionStatus.Expired) {
		return ruleFail(APP_ERROR.INVALID_STATE, '응답되었거나 만료된 청원에는 서명할 수 없습니다.');
	}

	if (petition.signedBy.includes(user._id)) {
		return ruleFail(APP_ERROR.INVALID_STATE, '이미 서명한 청원입니다.');
	}

	return ok();
}

export function canUnsignPetition(petition: PetitionEntity, user: User): RuleResult {
	if (!hasCapability(user, 'petition.sign')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '청원 서명을 취소할 권한이 없습니다.');
	}

	if (petition.status === PetitionStatus.Answered || petition.status === PetitionStatus.Expired) {
		return ruleFail(
			APP_ERROR.INVALID_STATE,
			'응답되었거나 만료된 청원은 서명을 취소할 수 없습니다.'
		);
	}

	if (!petition.signedBy.includes(user._id)) {
		return ruleFail(APP_ERROR.INVALID_STATE, '서명하지 않은 청원입니다.');
	}

	return ok();
}

export function canReviewPetition(petition: PetitionEntity, user: User): RuleResult {
	if (!hasCapability(user, 'petition.manage')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '청원을 검토할 권한이 없습니다.');
	}

	if (petition.status !== PetitionStatus.Pending) {
		return ruleFail(APP_ERROR.INVALID_STATE, '검토 대기 상태의 청원만 검토할 수 있습니다.');
	}

	return ok();
}

export function canUnreviewPetition(petition: PetitionEntity, user: User): RuleResult {
	if (!hasCapability(user, 'petition.manage')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '청원 검토를 취소할 권한이 없습니다.');
	}

	if (petition.status !== PetitionStatus.Reviewing) {
		return ruleFail(APP_ERROR.INVALID_STATE, '검토 중인 청원만 검토를 취소할 수 있습니다.');
	}

	return ok();
}

export function canRespondToPetition(petition: PetitionEntity, user: User): RuleResult {
	if (!hasCapability(user, 'petition.respond')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '청원에 응답할 권한이 없습니다.');
	}

	if (petition.status !== PetitionStatus.Reviewing) {
		return ruleFail(APP_ERROR.INVALID_STATE, '검토 중인 청원만 응답할 수 있습니다.');
	}

	if (hasResponse(petition)) {
		return ruleFail(APP_ERROR.INVALID_STATE, '이미 응답한 청원입니다.');
	}

	return ok();
}

export function canReviseResponse(petition: PetitionEntity, user: User): RuleResult {
	if (!hasCapability(user, 'petition.respond')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '청원 응답을 수정할 권한이 없습니다.');
	}

	if (!hasResponse(petition)) {
		return ruleFail(APP_ERROR.INVALID_STATE, '응답이 없는 청원입니다.');
	}

	return ok();
}

export function canDeleteResponse(petition: PetitionEntity, user: User): RuleResult {
	if (!hasCapability(user, 'petition.respond')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '청원 응답을 삭제할 권한이 없습니다.');
	}

	if (!hasResponse(petition)) {
		return ruleFail(APP_ERROR.INVALID_STATE, '응답이 없는 청원입니다.');
	}

	return ok();
}

function hasResponse(petition: PetitionEntity): boolean {
	return petition.responderId !== null;
}

function isExpired(petition: PetitionEntity): boolean {
	return petition.createdAt < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
}

export function getNextStatus(petition: PetitionEntity): PetitionStatus {
	if (petition.status !== PetitionStatus.Ongoing) return petition.status;
	if (petition.signedBy.length >= 30) return PetitionStatus.Pending;
	if (isExpired(petition)) return PetitionStatus.Expired;
	return PetitionStatus.Ongoing;
}
