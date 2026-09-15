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
import * as FeedbackRule from '$lib/rules/feedback.rule.js';
import { AppError, assertRule } from '$lib/server/errors.js';
import { assertUuid } from '$lib/server/id.js';
import { createPage } from '$lib/shared/paginate.js';
import { APP_ERROR } from '$lib/shared/rule.js';
import { FEEDBACK_KINDS } from '$lib/shared/submission.js';

function isFeedback(submission: SubmissionEntity): boolean {
	return FEEDBACK_KINDS.includes(submission.kind as (typeof FEEDBACK_KINDS)[number]);
}

export function getFeedbackPermissions(submission: SubmissionEntity, user: User) {
	return {
		canDelete: FeedbackRule.canDeleteFeedback(submission, user).ok,
		canSupport: FeedbackRule.canSupportFeedback(submission, user).ok,
		canCancelSupport: FeedbackRule.canCancelFeedbackSupport(submission, user).ok,
		canReview: FeedbackRule.canReviewFeedback(submission, user).ok,
		canCancelReview: FeedbackRule.canCancelFeedbackReview(submission, user).ok,
		canRespond: FeedbackRule.canRespondToFeedback(submission, user).ok,
		canEditResponse: FeedbackRule.canReviseFeedbackResponse(submission, user).ok,
		canDeleteResponse: FeedbackRule.canDeleteFeedbackResponse(submission, user).ok
	};
}

export async function createFeedback(input: SubmissionCreate, user: User) {
	assertRule(FeedbackRule.canCreateFeedback(user));
	return await SubmissionRepository.createSubmission(input);
}

export async function getFeedbackById(submissionId: SubmissionId): Promise<SubmissionEntity> {
	assertUuid(submissionId, '존재하지 않는 문의·건의입니다.');
	const submission = await SubmissionRepository.findSubmissionById(submissionId);
	if (!submission || !isFeedback(submission)) {
		throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 문의·건의입니다.');
	}
	return submission;
}

export async function viewFeedbackById(submissionId: SubmissionId): Promise<SubmissionEntity> {
	assertUuid(submissionId, '존재하지 않는 문의·건의입니다.');
	const submission = await SubmissionRepository.viewSubmissionById(submissionId);
	if (!submission || !isFeedback(submission)) {
		throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 문의·건의입니다.');
	}
	return submission;
}

export async function getFeedbackPage(limit = 10, skip = 0): Promise<Page<SubmissionEntity>> {
	const kinds = [...FEEDBACK_KINDS];
	const [items, totalCount] = await Promise.all([
		SubmissionRepository.findRecentSubmissions(kinds, limit, skip),
		SubmissionRepository.countSubmissions(kinds)
	]);
	return createPage(items, totalCount, limit, skip);
}

export async function getFeedbackPreviews(limit = 5): Promise<SubmissionPreview[]> {
	return await SubmissionRepository.findRecentSubmissionPreviews([...FEEDBACK_KINDS], limit);
}

export async function searchFeedbackByQuery(query: string, limit = 10, skip = 0) {
	return await SubmissionRepository.searchSubmissionsByQuery(
		query,
		[...FEEDBACK_KINDS],
		limit,
		skip
	);
}

export async function countFeedbackByQuery(query: string): Promise<number> {
	return await SubmissionRepository.countSubmissionsByQuery(query, [...FEEDBACK_KINDS]);
}

export async function deleteFeedbackById(submissionId: SubmissionId, user: User) {
	const submission = await getFeedbackById(submissionId);
	assertRule(FeedbackRule.canDeleteFeedback(submission, user));
	if (!(await SubmissionRepository.deleteSubmissionById(submissionId))) {
		throw new AppError(APP_ERROR.NOT_FOUND, '이미 삭제된 문의·건의입니다.');
	}
	return submission;
}

export async function supportFeedbackById(submissionId: SubmissionId, user: User) {
	const submission = await getFeedbackById(submissionId);
	assertRule(FeedbackRule.canSupportFeedback(submission, user));
	const updated = await SubmissionSupportRepository.supportSubmissionById(submissionId, user.id);
	if (!updated) throw new AppError(APP_ERROR.INVALID_STATE, '상태가 변경되어 공감할 수 없습니다.');
	return updated;
}

export async function cancelFeedbackSupportById(submissionId: SubmissionId, user: User) {
	const submission = await getFeedbackById(submissionId);
	assertRule(FeedbackRule.canCancelFeedbackSupport(submission, user));
	const updated = await SubmissionSupportRepository.cancelSubmissionSupportById(
		submissionId,
		user.id
	);
	if (!updated) {
		throw new AppError(APP_ERROR.INVALID_STATE, '상태가 변경되어 공감을 취소할 수 없습니다.');
	}
	return updated;
}

export async function reviewFeedbackById(submissionId: SubmissionId, user: User) {
	const submission = await getFeedbackById(submissionId);
	assertRule(FeedbackRule.canReviewFeedback(submission, user));
	return await requireStatusUpdate(submissionId, 'ongoing', 'reviewing');
}

export async function cancelFeedbackReviewById(submissionId: SubmissionId, user: User) {
	const submission = await getFeedbackById(submissionId);
	assertRule(FeedbackRule.canCancelFeedbackReview(submission, user));
	return await requireStatusUpdate(submissionId, 'reviewing', 'ongoing');
}

async function requireStatusUpdate(
	submissionId: SubmissionId,
	currentStatus: SubmissionEntity['status'],
	nextStatus: SubmissionEntity['status']
) {
	const updated = await SubmissionResponseRepository.updateSubmissionStatusById(
		submissionId,
		currentStatus,
		nextStatus
	);
	if (!updated) throw new AppError(APP_ERROR.INVALID_STATE, '문의·건의 상태가 변경되었습니다.');
	return updated;
}

export async function respondToFeedbackById(
	submissionId: SubmissionId,
	user: User,
	response: string
) {
	const submission = await getFeedbackById(submissionId);
	assertRule(FeedbackRule.canRespondToFeedback(submission, user));
	const updated = await SubmissionResponseRepository.respondToSubmissionById(
		submissionId,
		user.id,
		response,
		new Date().toISOString()
	);
	if (!updated) throw new AppError(APP_ERROR.INVALID_STATE, '상태가 변경되어 답변할 수 없습니다.');
	return updated;
}

export async function reviseFeedbackResponseById(
	submissionId: SubmissionId,
	user: User,
	response: string
) {
	const submission = await getFeedbackById(submissionId);
	assertRule(FeedbackRule.canReviseFeedbackResponse(submission, user));
	const updated = await SubmissionResponseRepository.reviseSubmissionResponseById(
		submissionId,
		user.id,
		response,
		new Date().toISOString()
	);
	if (!updated) throw new AppError(APP_ERROR.INVALID_STATE, '상태가 변경되어 수정할 수 없습니다.');
	return updated;
}

export async function deleteFeedbackResponseById(submissionId: SubmissionId, user: User) {
	const submission = await getFeedbackById(submissionId);
	assertRule(FeedbackRule.canDeleteFeedbackResponse(submission, user));
	const updated = await SubmissionResponseRepository.deleteSubmissionResponseById(submissionId);
	if (!updated) throw new AppError(APP_ERROR.INVALID_STATE, '상태가 변경되어 삭제할 수 없습니다.');
	return updated;
}
