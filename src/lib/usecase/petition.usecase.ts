import mongoose from 'mongoose';

import type {
	ActivityLogCreate,
	PetitionLogSnapshot,
	PetitionResponseSnapshot
} from '$lib/types/activity-log.type.js';
import type { FileId } from '$lib/types/file-meta.type.js';
import type { FilePresence } from '$lib/types/general.type.js';
import type { Page } from '$lib/types/general.type.js';
import type { PetitionId } from '$lib/types/petition.type.js';
import type { Petition, PetitionEntity } from '$lib/types/petition.type.js';

import * as ActivityLogService from '$lib/services/activity-log.service.js';
import * as FileMetaService from '$lib/services/file-meta.service.js';
import * as PetitionService from '$lib/services/petition.service.js';
import * as ThrottleService from '$lib/services/throttle.service.js';
import * as UserService from '$lib/services/user.service.js';
import { hasCapability } from '$lib/shared/permission.js';
import { createDisplayName } from '$lib/shared/utils.js';
import { DisplayType, type User, type UserId } from '$lib/types/user.type.js';

function collectPetitionUserIds(
	petitions: PetitionEntity[],
	extraUserIds: UserId[] = []
): Array<UserId> {
	return [
		...petitions.map((petition) => petition.petitionerId),
		...petitions
			.filter((petition) => petition.responderId !== null)
			.map((petition) => petition.responderId as UserId),
		...extraUserIds
	];
}

export async function findPetitionUserMap(
	petitions: PetitionEntity[],
	extraUserIds: UserId[] = []
): Promise<Map<string, User>> {
	return await UserService.findUserMapByIds(collectPetitionUserIds(petitions, extraUserIds));
}

export function attachPetitionNames(
	petitions: PetitionEntity[],
	userIdToUser: Map<string, User>
): Petition[] {
	return petitions.map((petition) => {
		const petitioner = userIdToUser.get(petition.petitionerId.toString());
		const responder =
			petition.responderId === null ? undefined : userIdToUser.get(petition.responderId.toString());

		return {
			...petition,
			petitionerName: petitioner ? createDisplayName(petitioner, DisplayType.RealName) : null,
			responderName: responder ? createDisplayName(responder, DisplayType.RealName) : null
		};
	});
}

function getSignerNames(petition: PetitionEntity, userIdToUser: Map<string, User>): string[] {
	return petition.signedBy
		.map((userId) => {
			const user = userIdToUser.get(userId.toString());
			return user ? createDisplayName(user, DisplayType.RealName) : null;
		})
		.filter((name): name is string => name !== null);
}

async function getPetitionLogSnapshot(petition: PetitionEntity): Promise<PetitionLogSnapshot> {
	const files = await FileMetaService.getFileMetasByArticleId(petition._id);
	return {
		...petition,
		fileIds: files.map((file) => file._id)
	};
}

function toPetitionResponseSnapshot(petition: PetitionEntity): PetitionResponseSnapshot {
	return {
		responderId: petition.responderId,
		response: petition.response,
		answeredAt: petition.answeredAt,
		status: petition.status
	};
}

export async function getPetitionPage(page: number, user: User) {
	const limit = 10;
	const skip = (page - 1) * limit;

	const petitionPage = await PetitionService.getPetitionPage(limit, skip);
	const [userIdToUser, filePresence] = await Promise.all([
		findPetitionUserMap(petitionPage.items),
		FileMetaService.getFilePresenceByArticleIds(petitionPage.items.map((petition) => petition._id))
	]);
	petitionPage.items = attachPetitionNames(petitionPage.items, userIdToUser);

	return {
		petitionPage: petitionPage as Page<Petition>,
		filePresence: filePresence as FilePresence,
		canCreatePetition: hasCapability(user, 'petition.write')
	};
}

export async function getPetitionDetail(
	petitionId: PetitionId,
	user: User,
	options?: { incrementView?: boolean }
) {
	const petitionRaw =
		options?.incrementView !== false
			? await PetitionService.viewPetitionById(petitionId)
			: await PetitionService.getPetitionById(petitionId);
	const [userIdToUser, files] = await Promise.all([
		findPetitionUserMap([petitionRaw], petitionRaw.signedBy),
		FileMetaService.getFileMetasByArticleId(petitionId)
	]);
	const [petition] = attachPetitionNames([petitionRaw], userIdToUser);
	const signerNames = getSignerNames(petitionRaw, userIdToUser);

	return {
		petition,
		signerNames,
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
	return await mongoose.connection.transaction(async () => {
		await ThrottleService.reserve(petitioner._id, 'article');
		const petition = await PetitionService.createPetition(
			{
				title,
				content,
				petitionerId: petitioner._id
			},
			petitioner
		);
		await FileMetaService.linkArticleToFiles(fileIds, petition._id);
		const petitionSnapshot = await getPetitionLogSnapshot(petition);
		const activityLog: ActivityLogCreate = {
			actorId: petitioner._id,
			action: 'create',
			targetType: 'petition',
			targetId: petition._id,
			parentTargetId: null,
			cause: 'direct',
			beforeSnapshot: null,
			afterSnapshot: petitionSnapshot
		};
		await ActivityLogService.create(activityLog);
		return petition;
	});
}

export async function deletePetitionById(petitionId: PetitionId, user: User) {
	return await mongoose.connection.transaction(async () => {
		const petition = await PetitionService.deletePetitionById(petitionId, user);
		const petitionSnapshot = await getPetitionLogSnapshot(petition);
		await FileMetaService.unlinkArticleFromAllFiles(petitionId);
		const activityLog: ActivityLogCreate = {
			actorId: user._id,
			action: 'delete',
			targetType: 'petition',
			targetId: petition._id,
			parentTargetId: null,
			cause: 'direct',
			beforeSnapshot: petitionSnapshot,
			afterSnapshot: null
		};
		await ActivityLogService.create(activityLog);
	});
}

export async function signPetition(petitionId: PetitionId, user: User) {
	return await PetitionService.signPetitionById(petitionId, user);
}

export async function unsignPetition(petitionId: PetitionId, user: User) {
	return await PetitionService.unsignPetitionById(petitionId, user);
}

export async function reviewPetition(petitionId: PetitionId, user: User) {
	return await PetitionService.reviewPetitionById(petitionId, user);
}

export async function unreviewPetition(petitionId: PetitionId, user: User) {
	return await PetitionService.unreviewPetitionById(petitionId, user);
}

export async function respondToPetition(petitionId: PetitionId, user: User, response: string) {
	return await mongoose.connection.transaction(async () => {
		const petition = await PetitionService.responseToPetitionById(petitionId, user, response);
		const activityLog: ActivityLogCreate = {
			actorId: user._id,
			action: 'create',
			targetType: 'petition-response',
			targetId: petition._id,
			parentTargetId: null,
			cause: 'direct',
			beforeSnapshot: null,
			afterSnapshot: toPetitionResponseSnapshot(petition)
		};
		await ActivityLogService.create(activityLog);
		return petition;
	});
}

export async function editPetitionResponse(petitionId: PetitionId, user: User, response: string) {
	return await mongoose.connection.transaction(async () => {
		const beforePetition = await PetitionService.getPetitionById(petitionId);
		const petition = await PetitionService.reviseResponseById(petitionId, user, response);
		const activityLog: ActivityLogCreate = {
			actorId: user._id,
			action: 'edit',
			targetType: 'petition-response',
			targetId: petition._id,
			parentTargetId: null,
			cause: 'direct',
			beforeSnapshot: toPetitionResponseSnapshot(beforePetition),
			afterSnapshot: toPetitionResponseSnapshot(petition)
		};
		await ActivityLogService.create(activityLog);
		return petition;
	});
}

export async function deletePetitionResponse(petitionId: PetitionId, user: User) {
	return await mongoose.connection.transaction(async () => {
		const beforePetition = await PetitionService.getPetitionById(petitionId);
		const petition = await PetitionService.deleteResponseById(petitionId, user);
		const activityLog: ActivityLogCreate = {
			actorId: user._id,
			action: 'delete',
			targetType: 'petition-response',
			targetId: petitionId,
			parentTargetId: null,
			cause: 'direct',
			beforeSnapshot: toPetitionResponseSnapshot(beforePetition),
			afterSnapshot: null
		};
		await ActivityLogService.create(activityLog);
		return petition;
	});
}
