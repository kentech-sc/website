import type { ActivityLogCreate } from '$lib/types/activity-log.type.js';
import type { FileId } from '$lib/types/file-meta.type.js';
import type { Submission, SubmissionEntity } from '$lib/types/submission.type.js';
import type { User, UserId } from '$lib/types/user.type.js';

import * as ActivityLogService from '$lib/services/activity-log.service.js';
import * as FileMetaService from '$lib/services/file-meta.service.js';
import * as UserService from '$lib/services/user.service.js';
import { createDisplayName } from '$lib/shared/utils.js';
import { DisplayType } from '$lib/types/user.type.js';

function collectUserIds(submissions: SubmissionEntity[], extraUserIds: UserId[]): UserId[] {
	return [
		...submissions.map((submission) => submission.authorId),
		...submissions
			.filter((submission) => submission.responderId !== null)
			.map((submission) => submission.responderId as UserId),
		...extraUserIds
	];
}

export async function findSubmissionUserMap(
	submissions: SubmissionEntity[],
	extraUserIds: UserId[] = []
): Promise<Map<string, User>> {
	return await UserService.findUserMapByIds(collectUserIds(submissions, extraUserIds));
}

export function attachSubmissionNames(
	submissions: SubmissionEntity[],
	userIdToUser: Map<string, User>
): Submission[] {
	return submissions.map((submission) => {
		const author = userIdToUser.get(submission.authorId);
		const responder = submission.responderId ? userIdToUser.get(submission.responderId) : undefined;

		return {
			...submission,
			authorName: author ? createDisplayName(author, submission.displayType) : null,
			responderName: responder ? createDisplayName(responder, DisplayType.RealName) : null
		};
	});
}

export function getSupporterNames(
	submission: SubmissionEntity,
	userIdToUser: Map<string, User>
): string[] {
	return submission.supporterIds
		.map((userId) => {
			const user = userIdToUser.get(userId);
			return user ? createDisplayName(user, DisplayType.RealName) : null;
		})
		.filter((name): name is string => name !== null);
}

export async function getSubmissionLogSnapshot(submission: SubmissionEntity) {
	const files = await FileMetaService.getFileMetasByArticleId(submission.id);
	return { ...submission, fileIds: files.map((file): FileId => file.id) };
}

export function toResponseSnapshot(submission: SubmissionEntity) {
	return {
		responderId: submission.responderId,
		response: submission.response,
		answeredAt: submission.answeredAt,
		status: submission.status
	};
}

export async function recordSubmissionCreate(actorId: UserId, submission: SubmissionEntity) {
	const activityLog: ActivityLogCreate = {
		actorId,
		action: 'create',
		targetType: 'submission',
		targetId: submission.id,
		cause: 'direct',
		beforeSnapshot: null,
		afterSnapshot: await getSubmissionLogSnapshot(submission)
	};
	await ActivityLogService.create(activityLog);
}

export async function recordSubmissionDelete(
	actorId: UserId,
	submissionId: SubmissionEntity['id'],
	snapshot: Awaited<ReturnType<typeof getSubmissionLogSnapshot>>
) {
	const activityLog: ActivityLogCreate = {
		actorId,
		action: 'delete',
		targetType: 'submission',
		targetId: submissionId,
		cause: 'direct',
		beforeSnapshot: snapshot,
		afterSnapshot: null
	};
	await ActivityLogService.create(activityLog);
}

export async function recordResponseCreate(actorId: UserId, submission: SubmissionEntity) {
	const activityLog: ActivityLogCreate = {
		actorId,
		action: 'create',
		targetType: 'submission-response',
		targetId: submission.id,
		cause: 'direct',
		beforeSnapshot: null,
		afterSnapshot: toResponseSnapshot(submission)
	};
	await ActivityLogService.create(activityLog);
}

export async function recordResponseEdit(
	actorId: UserId,
	before: SubmissionEntity,
	after: SubmissionEntity
) {
	const activityLog: ActivityLogCreate = {
		actorId,
		action: 'edit',
		targetType: 'submission-response',
		targetId: after.id,
		cause: 'direct',
		beforeSnapshot: toResponseSnapshot(before),
		afterSnapshot: toResponseSnapshot(after)
	};
	await ActivityLogService.create(activityLog);
}

export async function recordResponseDelete(actorId: UserId, before: SubmissionEntity) {
	const activityLog: ActivityLogCreate = {
		actorId,
		action: 'delete',
		targetType: 'submission-response',
		targetId: before.id,
		cause: 'direct',
		beforeSnapshot: toResponseSnapshot(before),
		afterSnapshot: null
	};
	await ActivityLogService.create(activityLog);
}
