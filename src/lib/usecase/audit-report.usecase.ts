import type { AuditReportId, AuditReportStatus } from '$lib/types/audit-report.type.js';
import type { User } from '$lib/types/user.type.js';

import { transaction } from '$lib/server/db.js';
import * as AuditReportService from '$lib/services/audit-report.service.js';
import * as ThrottleService from '$lib/services/throttle.service.js';
import { hasCapability } from '$lib/shared/permission.js';

export function canManageAuditReports(user: User): boolean {
	return hasCapability(user, 'audit.read');
}

export async function submitAuditReport(title: string, content: string, user: User) {
	return await transaction(async () => {
		await ThrottleService.reserve(user.id, 'article');
		return await AuditReportService.createAuditReport({ title, content }, user);
	});
}

export const getAuditReports = AuditReportService.getAuditReports;
export const getAuditReport = AuditReportService.getAuditReport;

export async function changeAuditReportStatus(
	id: AuditReportId,
	status: AuditReportStatus,
	user: User
) {
	return await AuditReportService.changeAuditReportStatus(id, status, user);
}
