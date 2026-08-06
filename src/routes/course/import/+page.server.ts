import { AppError, APP_ERROR, withActionErrorHandling } from '$lib/server/errors.js';
import { withLoadErrorHandling } from '$lib/server/errors.js';
import { hasCapability } from '$lib/shared/permission.js';
import * as AcademicUsecase from '$lib/usecase/academic.usecase.js';

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
		return await AcademicUsecase.importOfferings(
			locals.user,
			workbook,
			Number(data.get('year')),
			Number(data.get('term'))
		);
	}),
	createSpecialCourse: withActionErrorHandling(async ({ request, locals }) => {
		const data = await request.formData();
		const rawLevel = String(data.get('level') ?? '').trim();
		return await AcademicUsecase.createSpecialCourse(locals.user, {
			courseId: String(data.get('courseId') ?? ''),
			courseName: String(data.get('courseName') ?? ''),
			credits: Number(data.get('credits')),
			creditType: String(data.get('creditType') ?? 'numeric'),
			category: String(data.get('category') ?? ''),
			subcategory: String(data.get('subcategory') ?? '') || null,
			level: rawLevel ? Number(rawLevel) : null,
			gradExcluded: data.get('gradExcluded') === 'on'
		});
	})
};
