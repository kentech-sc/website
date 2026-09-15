import { translatedStatus } from '$lib/shared/view.js';
import {
	SubmissionCategory,
	SubmissionKind,
	type SubmissionCategory as SubmissionCategoryType,
	type SubmissionKind as SubmissionKindType,
	type SubmissionStatus
} from '$lib/types/submission.type.js';

export const FEEDBACK_KINDS = [SubmissionKind.Inquiry, SubmissionKind.Suggestion] as const;

export const SUBMISSION_KIND_LABELS: Record<SubmissionKindType, string> = {
	[SubmissionKind.Petition]: '청원',
	[SubmissionKind.Inquiry]: '문의',
	[SubmissionKind.Suggestion]: '건의'
};

export const SUBMISSION_CATEGORY_LABELS: Record<SubmissionCategoryType, string> = {
	[SubmissionCategory.Executive]: '학생회',
	[SubmissionCategory.Education]: '교육',
	[SubmissionCategory.Clubs]: '동아리',
	[SubmissionCategory.Audit]: '감사',
	[SubmissionCategory.Election]: '선거',
	[SubmissionCategory.Website]: '홈페이지',
	[SubmissionCategory.Other]: '기타'
};

export function isFeedbackKind(value: string): value is (typeof FEEDBACK_KINDS)[number] {
	return FEEDBACK_KINDS.includes(value as (typeof FEEDBACK_KINDS)[number]);
}

export function isSubmissionCategory(value: string): value is SubmissionCategoryType {
	return Object.hasOwn(SUBMISSION_CATEGORY_LABELS, value);
}

export function getSubmissionStatusLabel(
	kind: SubmissionKindType,
	status: SubmissionStatus
): string {
	if (kind !== SubmissionKind.Petition && status === 'ongoing') return '접수';
	return translatedStatus[status];
}
