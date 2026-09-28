import { SUBMISSION_STATUS_LABELS } from '$lib/shared/view.js';
export { SUBMISSION_STATUS_COLORS } from '$lib/shared/view.js';
import {
	SubmissionCategory,
	SubmissionKind,
	type SubmissionCategory as SubmissionCategoryType,
	type SubmissionKind as SubmissionKindType,
	type SubmissionStatus
} from '$lib/types/submission.type.js';

export const SUBMISSION_KIND_LABELS: Record<SubmissionKindType, string> = {
	[SubmissionKind.Petition]: '청원',
	[SubmissionKind.Feedback]: '문의·건의'
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

export function isSubmissionCategory(value: string): value is SubmissionCategoryType {
	return Object.hasOwn(SUBMISSION_CATEGORY_LABELS, value);
}

export function getSubmissionStatusLabel(
	kind: SubmissionKindType,
	status: SubmissionStatus
): string {
	if (kind !== SubmissionKind.Petition && status === 'ongoing') return '접수';
	return SUBMISSION_STATUS_LABELS[status];
}
