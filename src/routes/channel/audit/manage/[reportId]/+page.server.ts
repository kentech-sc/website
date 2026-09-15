import { fail } from '@sveltejs/kit';

import { withActionErrorHandling, withLoadErrorHandling } from '$lib/server/errors.js';
import { isAuditReportStatus } from '$lib/shared/audit-report.js';
import * as AuditReportUsecase from '$lib/usecase/audit-report.usecase.js';

export const load = withLoadErrorHandling(async ({ params, locals }) => {
	if (!params.reportId) throw new Error('감사원 제보 ID가 필요합니다.');
	return { report: await AuditReportUsecase.getAuditReport(params.reportId, locals.user) };
});

export const actions = {
	changeStatus: withActionErrorHandling(async ({ request, locals }) => {
		const formData = await request.formData();
		const reportId = (formData.get('reportId') ?? '').toString();
		const status = (formData.get('status') ?? '').toString();
		if (!isAuditReportStatus(status)) {
			return fail(400, { message: '올바른 처리 상태를 선택해 주세요.' });
		}
		return {
			report: await AuditReportUsecase.changeAuditReportStatus(reportId, status, locals.user)
		};
	})
};
