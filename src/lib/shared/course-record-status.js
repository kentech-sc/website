/** @typedef {import('$lib/types/academic.type.js').CourseRecordStatus} CourseRecordStatus */

const FAILED_GRADES = new Set(['F', 'U', 'NP', 'FAIL']);
const WITHDRAWN_GRADES = new Set(['W', 'WD', 'WITHDRAWN']);

/**
 * @param {string | null} grade
 * @param {CourseRecordStatus} selectedStatus
 * @returns {CourseRecordStatus}
 */
export function resolveCourseRecordStatus(grade, selectedStatus) {
	const normalizedGrade = grade?.trim().toUpperCase();
	if (normalizedGrade && FAILED_GRADES.has(normalizedGrade)) return 'failed';
	if (normalizedGrade && WITHDRAWN_GRADES.has(normalizedGrade)) return 'withdrawn';
	return selectedStatus;
}
