import type { CourseRecordStatus } from '$lib/types/academic.type.js';
import type { PageServerLoad } from './$types.js';

import { withActionErrorHandling } from '$lib/server/errors.js';
import * as AcademicUsecase from '$lib/usecase/academic.usecase.js';

export const load: PageServerLoad = async ({ locals }) => {
	return await AcademicUsecase.getProfileData(locals.user);
};

export const actions = {
	setGradeVisibility: withActionErrorHandling(async ({ request, locals }) => {
		const data = await request.formData();
		await AcademicUsecase.setGradeVisibility(locals.user, data.get('hideGrades') === 'true');
	}),
	saveAcademicProfile: withActionErrorHandling(async ({ request, locals }) => {
		const data = await request.formData();
		await AcademicUsecase.saveProfile(
			locals.user,
			Number(data.get('admissionYear')),
			data.getAll('espWaivedCourseIds').map(String)
		);
	}),
	addCourseRecord: withActionErrorHandling(async ({ request, locals }) => {
		const data = await request.formData();
		await AcademicUsecase.addCourseRecord(locals.user, {
			courseId: String(data.get('courseId') ?? ''),
			courseName: String(data.get('courseName') ?? ''),
			credits: Number(data.get('credits')),
			category: String(data.get('category') ?? ''),
			year: Number(data.get('year')),
			term: Number(data.get('term')),
			grade: String(data.get('grade') ?? '') || null,
			status: String(data.get('status') ?? 'passed') as CourseRecordStatus
		});
	}),
	importCourseRecords: withActionErrorHandling(async ({ request, locals }) => {
		const data = await request.formData();
		return await AcademicUsecase.importCourseRecords(
			locals.user,
			String(data.get('portalData') ?? ''),
			data.get('omitGrades') === 'on'
		);
	}),
	removeCourseRecord: withActionErrorHandling(async ({ request, locals }) => {
		const data = await request.formData();
		await AcademicUsecase.removeCourseRecord(locals.user, String(data.get('recordId')));
	})
};
