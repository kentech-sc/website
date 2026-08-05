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
	addExternalCompletion: withActionErrorHandling(async ({ request, locals }) => {
		const data = await request.formData();
		await AcademicUsecase.addExternalCompletion(
			locals.user,
			String(data.get('institution') ?? ''),
			String(data.get('courseCode') ?? ''),
			String(data.get('courseName') ?? ''),
			Number(data.get('year')),
			Number(data.get('term')),
			Number(data.get('credits')),
			String(data.get('grade') ?? '') || null,
			String(data.get('status') ?? 'passed') as CompletionStatus
		);
	}),
	addCompletion: withActionErrorHandling(async ({ request, locals }) => {
		const data = await request.formData();
		await AcademicUsecase.addCompletion(
			locals.user,
			String(data.get('courseId')),
			Number(data.get('year')),
			Number(data.get('term')),
			Number(data.get('credits')),
			String(data.get('grade') ?? '') || null,
			String(data.get('status') ?? 'passed') as CompletionStatus
		);
	}),
	importCompletions: withActionErrorHandling(async ({ request, locals }) => {
		const data = await request.formData();
		return await AcademicUsecase.importCompletions(
			locals.user,
			String(data.get('portalData') ?? '')
		);
	}),
	removeCompletion: withActionErrorHandling(async ({ request, locals }) => {
		const data = await request.formData();
		await AcademicUsecase.removeCompletion(locals.user, String(data.get('completionId')));
	})
};
