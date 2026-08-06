const AP_CREDIT_CODE_PATTERN = /^[A-Z]\d{6}$/;

/** @param {string} courseId */
export function isApCreditCode(courseId) {
	return AP_CREDIT_CODE_PATTERN.test(courseId.trim().toUpperCase());
}
