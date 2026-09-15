import type {
	AuditReportCreate,
	AuditReportId,
	AuditReportStatus
} from '$lib/types/audit-report.type.js';
import type { User } from '$lib/types/user.type.js';

import * as AuditReportRepository from '$lib/repositories/audit-report.repository.js';
import * as AuditReportRule from '$lib/rules/audit-report.rule.js';
import { AppError, assertRule } from '$lib/server/errors.js';
import { assertUuid } from '$lib/server/id.js';
import { APP_ERROR } from '$lib/shared/rule.js';

export async function createAuditReport(input: AuditReportCreate, user: User) {
	assertRule(AuditReportRule.canCreateAuditReport(user));
	return await AuditReportRepository.createAuditReport(input);
}

export async function getAuditReports(user: User) {
	assertRule(AuditReportRule.canReadAuditReport(user));
	return await AuditReportRepository.findAuditReports();
}

export async function getAuditReport(id: AuditReportId, user: User) {
	assertRule(AuditReportRule.canReadAuditReport(user));
	assertUuid(id, '존재하지 않는 감사원 제보입니다.');
	const report = await AuditReportRepository.findAuditReportById(id);
	if (!report) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 감사원 제보입니다.');
	return report;
}

export async function changeAuditReportStatus(
	id: AuditReportId,
	status: AuditReportStatus,
	user: User
) {
	assertRule(AuditReportRule.canManageAuditReport(user));
	assertUuid(id, '존재하지 않는 감사원 제보입니다.');
	const report = await AuditReportRepository.updateAuditReportStatus(id, status);
	if (!report) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 감사원 제보입니다.');
	return report;
}
