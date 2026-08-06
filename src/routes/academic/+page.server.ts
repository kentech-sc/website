import type { CompletionStatus } from '$lib/types/academic.type.js';
import type { PageServerLoad } from './$types.js';

import { withActionErrorHandling } from '$lib/server/errors.js';
import * as AcademicUsecase from '$lib/usecase/academic.usecase.js';

export const load: PageServerLoad = async ({ locals }) => {
	return await AcademicUsecase.getProfileData(locals.user);
};

export const actions = {
	saveAcademicProfile: withActionErrorHandling(async ({ request, locals }) => {
		const data = await request.formData();
		await AcademicUsecase.saveProfile(
			locals.user,
			Number(data.get('admissionYear')),
			data.getAll('espWaivedCourseIds').map(String)
		);
	}),
	addCompletion: withActionErrorHandling(async ({ request, locals }) => {
		const data = await request.formData();
		await AcademicUsecase.addCompletion(locals.user, {
			courseId: String(data.get('courseId') ?? ''),
			courseName: String(data.get('courseName') ?? ''),
			credits: Number(data.get('credits')),
			category: String(data.get('category') ?? ''),
			year: Number(data.get('year')),
			term: Number(data.get('term')),
			grade: String(data.get('grade') ?? '') || null,
			status: String(data.get('status') ?? 'passed') as CompletionStatus
		});
	}),
	importCompletions: withActionErrorHandling(async ({ request, locals }) => {
		const data = await request.formData();
		return await AcademicUsecase.importCompletions(
			locals.user,
			String(data.get('portalData') ?? ''),
			data.get('hideGrade') === 'on'
		);
	}),
	removeCompletion: withActionErrorHandling(async ({ request, locals }) => {
		const data = await request.formData();
		await AcademicUsecase.removeCompletion(locals.user, String(data.get('completionId')));
	})
};
