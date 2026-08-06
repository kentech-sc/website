/** @typedef {import('$lib/types/academic.type.js').CompletionStatus} CompletionStatus */

const FAILED_GRADES = new Set(['F', 'U', 'NP', 'FAIL']);
const WITHDRAWN_GRADES = new Set(['W', 'WD', 'WITHDRAWN']);

/**
 * @param {string | null} grade
 * @param {CompletionStatus} selectedStatus
 * @returns {CompletionStatus}
 */
export function resolveCompletionStatus(grade, selectedStatus) {
	const normalizedGrade = grade?.trim().toUpperCase();
	if (normalizedGrade && FAILED_GRADES.has(normalizedGrade)) return 'failed';
	if (normalizedGrade && WITHDRAWN_GRADES.has(normalizedGrade)) return 'withdrawn';
	return selectedStatus;
}
