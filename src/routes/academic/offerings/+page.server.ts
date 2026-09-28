import { AppError, APP_ERROR, withActionErrorHandling } from '$lib/server/errors.js';
import { withLoadErrorHandling } from '$lib/server/errors.js';
import { hasCapability } from '$lib/shared/permission.js';
import * as OfferingImportUsecase from '$lib/usecase/offering-import.usecase.js';

export const load = withLoadErrorHandling(async ({ locals }) => {
	if (!hasCapability(locals.user, 'course.manage'))
		throw new AppError(APP_ERROR.FORBIDDEN, '강의 데이터를 관리할 권한이 없습니다.');
	return {};
});

export const actions = {
	importOfferings: withActionErrorHandling(async ({ request, locals }) => {
		const data = await request.formData();
		const workbook = data.get('workbook');
		if (!(workbook instanceof File))
			throw new AppError(APP_ERROR.BAD_REQUEST, '엑셀 파일이 필요합니다.');
		return await OfferingImportUsecase.importOfferings(
			locals.user,
			workbook,
			Number(data.get('year')),
			Number(data.get('term'))
		);
	})
};
