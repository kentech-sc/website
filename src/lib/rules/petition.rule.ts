import type { RuleResult } from '$lib/types/general.type.js';
import type { User } from '$lib/types/user.type.js';

import { hasCapability, isOwner } from '$lib/shared/permission.js';
import { APP_ERROR, ok, ruleFail } from '$lib/shared/rule.js';
import { SubmissionStatus, type SubmissionEntity } from '$lib/types/submission.type.js';

export const PETITION_DURATION_DAYS = 30;
export const PETITION_SUPPORT_THRESHOLD = 10;

export function canCreatePetition(user: User): RuleResult {
	if (hasCapability(user, 'petition.write')) return ok();
	return ruleFail(APP_ERROR.FORBIDDEN, '청원을 작성할 권한이 없습니다.');
}

export function canDeletePetition(petition: SubmissionEntity, user: User): RuleResult {
	if (isOwner(user, petition.authorId) || hasCapability(user, 'petition.delete.any')) {
		return ok();
	}

	return ruleFail(APP_ERROR.FORBIDDEN, '청원을 삭제할 권한이 없습니다.');
}

export function canSignPetition(petition: SubmissionEntity, user: User): RuleResult {
	if (!hasCapability(user, 'petition.sign')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '청원에 서명할 권한이 없습니다.');
	}

	if (isOwner(user, petition.authorId)) {
		return ruleFail(APP_ERROR.INVALID_STATE, '본인 청원에는 서명할 수 없습니다.');
	}

	if (
		petition.status === SubmissionStatus.Answered ||
		petition.status === SubmissionStatus.Expired
	) {
		return ruleFail(APP_ERROR.INVALID_STATE, '응답되었거나 만료된 청원에는 서명할 수 없습니다.');
	}

	if (petition.supporterIds.includes(user.id)) {
		return ruleFail(APP_ERROR.INVALID_STATE, '이미 서명한 청원입니다.');
	}

	return ok();
}

export function canUnsignPetition(petition: SubmissionEntity, user: User): RuleResult {
	if (!hasCapability(user, 'petition.sign')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '청원 서명을 취소할 권한이 없습니다.');
	}

	if (
		petition.status === SubmissionStatus.Answered ||
		petition.status === SubmissionStatus.Expired
	) {
		return ruleFail(
			APP_ERROR.INVALID_STATE,
			'응답되었거나 만료된 청원은 서명을 취소할 수 없습니다.'
		);
	}

	if (!petition.supporterIds.includes(user.id)) {
		return ruleFail(APP_ERROR.INVALID_STATE, '서명하지 않은 청원입니다.');
	}

	return ok();
}

export function canReviewPetition(petition: SubmissionEntity, user: User): RuleResult {
	if (!hasCapability(user, 'petition.manage')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '청원을 검토할 권한이 없습니다.');
	}

	if (petition.status !== SubmissionStatus.Pending) {
		return ruleFail(APP_ERROR.INVALID_STATE, '검토 대기 상태의 청원만 검토할 수 있습니다.');
	}

	return ok();
}

export function canUnreviewPetition(petition: SubmissionEntity, user: User): RuleResult {
	if (!hasCapability(user, 'petition.manage')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '청원 검토를 취소할 권한이 없습니다.');
	}

	if (petition.status !== SubmissionStatus.Reviewing) {
		return ruleFail(APP_ERROR.INVALID_STATE, '검토 중인 청원만 검토를 취소할 수 있습니다.');
	}

	return ok();
}

export function canRespondToPetition(petition: SubmissionEntity, user: User): RuleResult {
	if (!hasCapability(user, 'petition.respond')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '청원에 응답할 권한이 없습니다.');
	}

	if (petition.status !== SubmissionStatus.Reviewing) {
		return ruleFail(APP_ERROR.INVALID_STATE, '검토 중인 청원만 응답할 수 있습니다.');
	}

	if (hasResponse(petition)) {
		return ruleFail(APP_ERROR.INVALID_STATE, '이미 응답한 청원입니다.');
	}

	return ok();
}

export function canReviseResponse(petition: SubmissionEntity, user: User): RuleResult {
	if (!hasCapability(user, 'petition.respond')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '청원 응답을 수정할 권한이 없습니다.');
	}

	if (!hasResponse(petition)) {
		return ruleFail(APP_ERROR.INVALID_STATE, '응답이 없는 청원입니다.');
	}

	return ok();
}

export function canDeleteResponse(petition: SubmissionEntity, user: User): RuleResult {
	if (!hasCapability(user, 'petition.respond')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '청원 응답을 삭제할 권한이 없습니다.');
	}

	if (!hasResponse(petition)) {
		return ruleFail(APP_ERROR.INVALID_STATE, '응답이 없는 청원입니다.');
	}

	return ok();
}

function hasResponse(petition: SubmissionEntity): boolean {
	return petition.responderId !== null;
}

function isExpired(petition: SubmissionEntity): boolean {
	const durationMs = PETITION_DURATION_DAYS * 24 * 60 * 60 * 1000;
	return petition.createdAt < new Date(Date.now() - durationMs).toISOString();
}

export function getNextStatus(petition: SubmissionEntity): SubmissionStatus {
	if (petition.status !== SubmissionStatus.Ongoing) return petition.status;
	if (petition.supporterIds.length >= PETITION_SUPPORT_THRESHOLD) return SubmissionStatus.Pending;
	if (isExpired(petition)) return SubmissionStatus.Expired;
	return SubmissionStatus.Ongoing;
}
