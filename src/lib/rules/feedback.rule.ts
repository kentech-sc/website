import type { RuleResult } from '$lib/types/general.type.js';
import type { SubmissionEntity } from '$lib/types/submission.type.js';
import type { User } from '$lib/types/user.type.js';

import { hasCapability, isOwner } from '$lib/shared/permission.js';
import { APP_ERROR, ok, ruleFail } from '$lib/shared/rule.js';
import { SubmissionStatus } from '$lib/types/submission.type.js';

export function canCreateFeedback(user: User): RuleResult {
	if (hasCapability(user, 'feedback.write')) return ok();
	return ruleFail(APP_ERROR.FORBIDDEN, '문의·건의를 작성할 권한이 없습니다.');
}

export function canDeleteFeedback(submission: SubmissionEntity, user: User): RuleResult {
	if (isOwner(user, submission.authorId) || hasCapability(user, 'feedback.delete.any')) return ok();
	return ruleFail(APP_ERROR.FORBIDDEN, '문의·건의를 삭제할 권한이 없습니다.');
}

export function canSupportFeedback(submission: SubmissionEntity, user: User): RuleResult {
	if (!hasCapability(user, 'feedback.support')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '공감할 권한이 없습니다.');
	}
	if (isOwner(user, submission.authorId)) {
		return ruleFail(APP_ERROR.INVALID_STATE, '본인 글에는 공감할 수 없습니다.');
	}
	if (submission.status === SubmissionStatus.Answered) {
		return ruleFail(APP_ERROR.INVALID_STATE, '답변이 완료된 글에는 공감할 수 없습니다.');
	}
	if (submission.supporterIds.includes(user.id)) {
		return ruleFail(APP_ERROR.INVALID_STATE, '이미 공감한 글입니다.');
	}
	return ok();
}

export function canCancelFeedbackSupport(submission: SubmissionEntity, user: User): RuleResult {
	if (!hasCapability(user, 'feedback.support')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '공감을 취소할 권한이 없습니다.');
	}
	if (!submission.supporterIds.includes(user.id)) {
		return ruleFail(APP_ERROR.INVALID_STATE, '공감하지 않은 글입니다.');
	}
	if (submission.status === SubmissionStatus.Answered) {
		return ruleFail(APP_ERROR.INVALID_STATE, '답변이 완료된 글의 공감은 취소할 수 없습니다.');
	}
	return ok();
}

export function canReviewFeedback(submission: SubmissionEntity, user: User): RuleResult {
	if (!hasCapability(user, 'feedback.manage')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '문의·건의를 검토할 권한이 없습니다.');
	}
	if (submission.status !== SubmissionStatus.Ongoing) {
		return ruleFail(APP_ERROR.INVALID_STATE, '접수 상태의 글만 검토할 수 있습니다.');
	}
	return ok();
}

export function canCancelFeedbackReview(submission: SubmissionEntity, user: User): RuleResult {
	if (!hasCapability(user, 'feedback.manage')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '검토를 취소할 권한이 없습니다.');
	}
	if (submission.status !== SubmissionStatus.Reviewing) {
		return ruleFail(APP_ERROR.INVALID_STATE, '검토 중인 글만 접수 상태로 되돌릴 수 있습니다.');
	}
	return ok();
}

export function canRespondToFeedback(submission: SubmissionEntity, user: User): RuleResult {
	if (!hasCapability(user, 'feedback.respond')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '문의·건의에 답변할 권한이 없습니다.');
	}
	if (submission.status !== SubmissionStatus.Reviewing || submission.responderId !== null) {
		return ruleFail(APP_ERROR.INVALID_STATE, '검토 중이며 답변이 없는 글에만 답변할 수 있습니다.');
	}
	return ok();
}

export function canReviseFeedbackResponse(submission: SubmissionEntity, user: User): RuleResult {
	if (!hasCapability(user, 'feedback.respond')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '답변을 수정할 권한이 없습니다.');
	}
	if (submission.responderId === null) {
		return ruleFail(APP_ERROR.INVALID_STATE, '답변이 없는 글입니다.');
	}
	return ok();
}

export const canDeleteFeedbackResponse = canReviseFeedbackResponse;
