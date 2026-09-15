import type { FileId } from '$lib/types/file-meta.type.js';
import type { FilePresence, Page } from '$lib/types/general.type.js';
import type {
	Submission,
	SubmissionCategory,
	SubmissionId,
	SubmissionKind
} from '$lib/types/submission.type.js';
import type { DisplayType, User } from '$lib/types/user.type.js';

import { transaction } from '$lib/server/db.js';
import * as FeedbackService from '$lib/services/feedback.service.js';
import * as FileMetaService from '$lib/services/file-meta.service.js';
import * as ThrottleService from '$lib/services/throttle.service.js';
import { hasCapability } from '$lib/shared/permission.js';
import {
	attachSubmissionNames,
	findSubmissionUserMap,
	getSubmissionLogSnapshot,
	recordResponseCreate,
	recordResponseDelete,
	recordResponseEdit,
	recordSubmissionCreate,
	recordSubmissionDelete
} from '$lib/usecase/submission.usecase.js';

export async function getFeedbackPage(page: number, user: User) {
	const limit = 10;
	const submissionPage = await FeedbackService.getFeedbackPage(limit, (page - 1) * limit);
	const [userMap, filePresence] = await Promise.all([
		findSubmissionUserMap(submissionPage.items),
		FileMetaService.getFilePresenceByArticleIds(submissionPage.items.map(({ id }) => id))
	]);
	submissionPage.items = attachSubmissionNames(submissionPage.items, userMap);

	return {
		submissionPage: submissionPage as Page<Submission>,
		filePresence: filePresence as FilePresence,
		canCreateFeedback: hasCapability(user, 'feedback.write')
	};
}

export async function getFeedbackDetail(
	submissionId: SubmissionId,
	user: User,
	options?: { incrementView?: boolean }
) {
	const raw =
		options?.incrementView === false
			? await FeedbackService.getFeedbackById(submissionId)
			: await FeedbackService.viewFeedbackById(submissionId);
	const [userMap, files] = await Promise.all([
		findSubmissionUserMap([raw]),
		FileMetaService.getFileMetasByArticleId(submissionId)
	]);
	const [submission] = attachSubmissionNames([raw], userMap);
	return {
		submission,
		files,
		permissions: FeedbackService.getFeedbackPermissions(submission, user)
	};
}

export async function createFeedback(
	kind: SubmissionKind,
	category: SubmissionCategory,
	displayType: DisplayType,
	title: string,
	content: string,
	author: User,
	fileIds: FileId[]
) {
	return await transaction(async () => {
		await ThrottleService.reserve(author.id, 'article');
		const submission = await FeedbackService.createFeedback(
			{ kind, category, displayType, title, content, authorId: author.id },
			author
		);
		await FileMetaService.linkArticleToFiles(fileIds, submission.id);
		await recordSubmissionCreate(author.id, submission);
		return submission;
	});
}

export async function deleteFeedback(submissionId: SubmissionId, user: User) {
	return await transaction(async () => {
		const current = await FeedbackService.getFeedbackById(submissionId);
		const snapshot = await getSubmissionLogSnapshot(current);
		await FeedbackService.deleteFeedbackById(submissionId, user);
		await FileMetaService.unlinkArticleFromAllFiles(submissionId);
		await recordSubmissionDelete(user.id, submissionId, snapshot);
	});
}

export const supportFeedback = FeedbackService.supportFeedbackById;
export const cancelFeedbackSupport = FeedbackService.cancelFeedbackSupportById;
export const reviewFeedback = FeedbackService.reviewFeedbackById;
export const cancelFeedbackReview = FeedbackService.cancelFeedbackReviewById;

export async function respondToFeedback(submissionId: SubmissionId, user: User, response: string) {
	return await transaction(async () => {
		const submission = await FeedbackService.respondToFeedbackById(submissionId, user, response);
		await recordResponseCreate(user.id, submission);
		return submission;
	});
}

export async function reviseFeedbackResponse(
	submissionId: SubmissionId,
	user: User,
	response: string
) {
	return await transaction(async () => {
		const before = await FeedbackService.getFeedbackById(submissionId);
		const submission = await FeedbackService.reviseFeedbackResponseById(
			submissionId,
			user,
			response
		);
		await recordResponseEdit(user.id, before, submission);
		return submission;
	});
}

export async function deleteFeedbackResponse(submissionId: SubmissionId, user: User) {
	return await transaction(async () => {
		const before = await FeedbackService.getFeedbackById(submissionId);
		const submission = await FeedbackService.deleteFeedbackResponseById(submissionId, user);
		await recordResponseDelete(user.id, before);
		return submission;
	});
}
