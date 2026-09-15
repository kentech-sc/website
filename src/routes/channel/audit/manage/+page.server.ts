import { withLoadErrorHandling } from '$lib/server/errors.js';
import * as AuditReportUsecase from '$lib/usecase/audit-report.usecase.js';

export const load = withLoadErrorHandling(async ({ locals }) => ({
	reports: await AuditReportUsecase.getAuditReports(locals.user)
}));
