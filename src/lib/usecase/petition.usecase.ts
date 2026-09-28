import type { FileId } from '$lib/types/file-meta.type.js';
import type { FilePresence } from '$lib/types/general.type.js';
import type { Page } from '$lib/types/general.type.js';
import type { Submission, SubmissionId } from '$lib/types/submission.type.js';

import { transaction } from '$lib/server/db.js';
import * as FileMetaService from '$lib/services/file-meta.service.js';
import * as PetitionService from '$lib/services/petition.service.js';
import * as PointService from '$lib/services/point.service.js';
import * as ThrottleService from '$lib/services/throttle.service.js';
import { hasCapability } from '$lib/shared/permission.js';
import { SubmissionKind } from '$lib/types/submission.type.js';
import { AuthorNameMode, type User } from '$lib/types/user.type.js';
import {
	attachSubmissionNames,
	findSubmissionUserMap,
	getSubmissionLogSnapshot,
	getSupporterNames,
	recordResponseCreate,
	recordResponseDelete,
	recordResponseEdit,
	recordSubmissionCreate,
	recordSubmissionDelete,
	recordSubmissionEdit
} from '$lib/usecase/submission.usecase.js';

export async function getPetitionPage(page: number, user: User) {
	const limit = 10;
	const skip = (page - 1) * limit;

	const petitionPage = await PetitionService.getPetitionPage(limit, skip);
	const [userIdToUser, filePresence] = await Promise.all([
		findSubmissionUserMap(petitionPage.items),
		FileMetaService.getFilePresenceByArticleIds(petitionPage.items.map((petition) => petition.id))
	]);
	petitionPage.items = attachSubmissionNames(petitionPage.items, userIdToUser);

	return {
		petitionPage: petitionPage as Page<Submission>,
		filePresence: filePresence as FilePresence,
		canCreatePetition: hasCapability(user, 'petition.write')
	};
}

export async function getPetitionDetail(
	petitionId: SubmissionId,
	user: User,
	options?: { incrementView?: boolean }
) {
	const petitionRaw =
		options?.incrementView !== false
			? await PetitionService.viewPetitionById(petitionId)
			: await PetitionService.getPetitionById(petitionId);
	const [userIdToUser, files] = await Promise.all([
		findSubmissionUserMap([petitionRaw], petitionRaw.supporterIds),
		FileMetaService.getFileMetasByArticleId(petitionId)
	]);
	const [petition] = attachSubmissionNames([petitionRaw], userIdToUser);
	const supporterNames = getSupporterNames(petitionRaw, userIdToUser);

	return {
		petition,
		supporterNames,
		files,
		permissions: PetitionService.getPetitionPermissions(petition, user)
	};
}

export async function createPetition(
	title: string,
	content: string,
	petitioner: User,
	fileIds: FileId[]
) {
	return await transaction(async () => {
		await ThrottleService.reserve(petitioner.id, 'article');
		const petition = await PetitionService.createPetition(
			{
				kind: SubmissionKind.Petition,
				category: null,
				authorNameMode: AuthorNameMode.RealName,
				title,
				content,
				authorId: petitioner.id
			},
			petitioner
		);
		await FileMetaService.linkArticleToFiles(fileIds, petition.id);
		await recordSubmissionCreate(petitioner.id, petition);
		await PointService.awardPetitionCreate(petitioner.id, petition.id);
		return petition;
	});
}

export async function deletePetitionById(petitionId: SubmissionId, user: User) {
	return await transaction(async () => {
		const beforePetition = await PetitionService.getPetitionById(petitionId);
		const petitionSnapshot = await getSubmissionLogSnapshot(beforePetition);
		const petition = await PetitionService.deletePetitionById(petitionId, user);
		await FileMetaService.unlinkArticleFromAllFiles(petitionId);
		await recordSubmissionDelete(user.id, petition.id, petitionSnapshot);
	});
}

export async function editPetition(
	petitionId: SubmissionId,
	title: string,
	content: string,
	user: User,
	fileIds: FileId[]
) {
	return await transaction(async () => {
		const before = await PetitionService.getPetitionById(petitionId);
		const beforeSnapshot = await getSubmissionLogSnapshot(before);
		const petition = await PetitionService.editPetitionById(petitionId, { title, content }, user);
		await FileMetaService.linkArticleToFiles(fileIds, petitionId);
		await recordSubmissionEdit(user.id, beforeSnapshot, await getSubmissionLogSnapshot(petition));
		return petition;
	});
}

export async function supportPetition(petitionId: SubmissionId, user: User) {
	return await transaction(async () => {
		const petition = await PetitionService.supportPetitionById(petitionId, user);
		await PointService.applyPetitionSignDelta(petition.authorId, petitionId, user.id, 2);
		return petition;
	});
}

export async function cancelPetitionSupport(petitionId: SubmissionId, user: User) {
	return await transaction(async () => {
		const petition = await PetitionService.cancelPetitionSupportById(petitionId, user);
		await PointService.applyPetitionSignDelta(petition.authorId, petitionId, user.id, -2);
		return petition;
	});
}

export async function startPetitionReview(petitionId: SubmissionId, user: User) {
	return await PetitionService.startPetitionReviewById(petitionId, user);
}

export async function cancelPetitionReview(petitionId: SubmissionId, user: User) {
	return await PetitionService.cancelPetitionReviewById(petitionId, user);
}

export async function respondToPetition(submissionId: SubmissionId, user: User, response: string) {
	return await transaction(async () => {
		const petition = await PetitionService.respondToPetitionById(submissionId, user, response);
		await recordResponseCreate(user.id, petition);
		return petition;
	});
}

export async function updatePetitionResponse(
	submissionId: SubmissionId,
	user: User,
	response: string
) {
	return await transaction(async () => {
		const beforePetition = await PetitionService.getPetitionById(submissionId);
		const petition = await PetitionService.updatePetitionResponseById(submissionId, user, response);
		await recordResponseEdit(user.id, beforePetition, petition);
		return petition;
	});
}

export async function deletePetitionResponse(submissionId: SubmissionId, user: User) {
	return await transaction(async () => {
		const beforePetition = await PetitionService.getPetitionById(submissionId);
		const petition = await PetitionService.deleteResponseById(submissionId, user);
		await recordResponseDelete(user.id, beforePetition);
		return petition;
	});
}
