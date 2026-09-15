import { fail, redirect } from '@sveltejs/kit';

import { withActionErrorHandling } from '$lib/server/errors.js';
import { setServerFlash } from '$lib/server/flash.js';
import * as AuditReportUsecase from '$lib/usecase/audit-report.usecase.js';

export const load = ({ locals }) => ({
	canManage: AuditReportUsecase.canManageAuditReports(locals.user)
});

export const actions = {
	submitReport: withActionErrorHandling(async ({ request, locals, cookies }) => {
		const formData = await request.formData();
		const title = (formData.get('title') ?? '').toString().trim();
		const content = (formData.get('content') ?? '').toString().trim();

		if (title.length < 2 || title.length > 120) {
			return fail(400, { message: '제목은 2자 이상 120자 이하로 입력해 주세요.' });
		}
		if (content.length < 10 || content.length > 10000) {
			return fail(400, { message: '제보 내용은 10자 이상 10,000자 이하로 입력해 주세요.' });
		}

		await AuditReportUsecase.submitAuditReport(title, content, locals.user);
		setServerFlash(cookies, { kind: 'success', message: '감사원에 익명 제보가 접수되었습니다.' });
		throw redirect(303, '/channel/audit');
	})
};
