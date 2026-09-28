import type { SubmissionStatus } from '$lib/types/submission.type.js';

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
	ongoing: '진행 중',
	pending: '검토 대기',
	reviewing: '검토 중',
	answered: '답변 완료',
	expired: '기간 만료'
};

export const SUBMISSION_STATUS_COLORS: Record<SubmissionStatus, string> = {
	ongoing: 'blue',
	pending: 'orange',
	reviewing: 'red',
	answered: 'green',
	expired: 'gray'
};

export const TERM_LABELS: Record<number, string> = {
	1: '1',
	2: '2',
	3: '여름',
	4: '겨울'
};
