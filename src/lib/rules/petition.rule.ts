import { PetitionStatus, type Petition } from '$lib/types/petition.type.js';
import type { User } from '$lib/types/user.type.js';

import { hasCapability, isOwner } from '$lib/shared/permission.js';
import { APP_ERROR, ok, ruleFail, type RuleResult } from '$lib/shared/rule.js';

export function canCreatePetition(user: User): RuleResult {
	if (hasCapability(user, 'petition.write')) return ok();
	return ruleFail(APP_ERROR.FORBIDDEN, '청원을 작성할 권한이 없습니다.');
}

export function canDeletePetition(petition: Petition, user: User): RuleResult {
	if (isOwner(user, petition.petitionerId) || hasCapability(user, 'petition.delete.any')) {
		return ok();
	}

	return ruleFail(APP_ERROR.FORBIDDEN, '청원을 삭제할 권한이 없습니다.');
}

export function canManagePetition(user: User): RuleResult {
	if (hasCapability(user, 'petition.manage')) return ok();
	return ruleFail(APP_ERROR.FORBIDDEN, '청원을 검토할 권한이 없습니다.');
}

export function canSignPetition(petition: Petition, user: User): RuleResult {
	if (!hasCapability(user, 'petition.sign')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '청원에 서명할 권한이 없습니다.');
	}

	if (isOwner(user, petition.petitionerId)) {
		return ruleFail(APP_ERROR.INVALID_STATE, '본인 청원에는 서명할 수 없습니다.');
	}

	if (petition.status === PetitionStatus.Answered || petition.status === PetitionStatus.Expired) {
		return ruleFail(APP_ERROR.INVALID_STATE, '답변되었거나 만료된 청원에는 서명할 수 없습니다.');
	}

	if (petition.signedBy.includes(user._id)) {
		return ruleFail(APP_ERROR.INVALID_STATE, '이미 서명한 청원입니다.');
	}

	return ok();
}

export function canUnsignPetition(petition: Petition, user: User): RuleResult {
	if (!hasCapability(user, 'petition.sign')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '청원 서명을 취소할 권한이 없습니다.');
	}

	if (petition.status === PetitionStatus.Answered || petition.status === PetitionStatus.Expired) {
		return ruleFail(
			APP_ERROR.INVALID_STATE,
			'답변되었거나 만료된 청원은 서명을 취소할 수 없습니다.'
		);
	}

	if (!petition.signedBy.includes(user._id)) {
		return ruleFail(APP_ERROR.INVALID_STATE, '서명하지 않은 청원입니다.');
	}

	return ok();
}

export function canReviewPetition(petition: Petition, user: User): RuleResult {
	if (!hasCapability(user, 'petition.manage')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '청원을 검토할 권한이 없습니다.');
	}

	if (petition.status !== PetitionStatus.Pending) {
		return ruleFail(APP_ERROR.INVALID_STATE, '검토 대기 상태의 청원만 검토할 수 있습니다.');
	}

	return ok();
}

export function canUnreviewPetition(petition: Petition, user: User): RuleResult {
	if (!hasCapability(user, 'petition.manage')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '청원 검토를 취소할 권한이 없습니다.');
	}

	if (petition.status !== PetitionStatus.Reviewing) {
		return ruleFail(APP_ERROR.INVALID_STATE, '검토 중인 청원만 검토를 취소할 수 있습니다.');
	}

	return ok();
}

export function canRespondToPetition(petition: Petition, user: User): RuleResult {
	if (!hasCapability(user, 'petition.respond')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '청원에 답변할 권한이 없습니다.');
	}

	if (petition.status !== PetitionStatus.Reviewing) {
		return ruleFail(APP_ERROR.INVALID_STATE, '검토 중인 청원만 답변할 수 있습니다.');
	}

	if (hasResponse(petition)) {
		return ruleFail(APP_ERROR.INVALID_STATE, '이미 답변된 청원입니다.');
	}

	return ok();
}

export function canReviseResponse(petition: Petition, user: User): RuleResult {
	if (!hasCapability(user, 'petition.respond')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '청원 답변을 수정할 권한이 없습니다.');
	}

	if (!hasResponse(petition)) {
		return ruleFail(APP_ERROR.INVALID_STATE, '답변이 없는 청원입니다.');
	}

	return ok();
}

export function canDeleteResponse(petition: Petition, user: User): RuleResult {
	if (!hasCapability(user, 'petition.respond')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '청원 답변을 삭제할 권한이 없습니다.');
	}

	if (!hasResponse(petition)) {
		return ruleFail(APP_ERROR.INVALID_STATE, '답변이 없는 청원입니다.');
	}

	return ok();
}

export function hasResponse(petition: Petition): boolean {
	return petition.responderId !== null;
}

export function isExpired(petition: Petition): boolean {
	return petition.createdAt < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
}

export function getNextStatus(petition: Petition): PetitionStatus {
	if (petition.status !== PetitionStatus.Ongoing) return petition.status;
	if (petition.signCnt >= 30) return PetitionStatus.Pending;
	if (isExpired(petition)) return PetitionStatus.Expired;
	return PetitionStatus.Ongoing;
}
