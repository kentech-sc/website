import mongoose from 'mongoose';

import type { FileId } from '$lib/types/file-meta.type.js';
import type { FilePresence } from '$lib/types/general.type.js';
import type { Petition, PetitionId } from '$lib/types/petition.type.js';
import { DisplayType, type User, type UserId } from '$lib/types/user.type.js';

import { hasCapability } from '$lib/shared/permission.js';
import { createDisplayName } from '$lib/shared/utils.js';

import * as FileMetaService from '$lib/services/file-meta.service.js';
import * as PetitionService from '$lib/services/petition.service.js';
import * as UserService from '$lib/services/user.service.js';

async function getSignersRealNamesByPetition(petition: Petition): Promise<string[]> {
	const users = await UserService.findUsersByIds(petition.signedBy);
	return users
		.map((user) => (user ? createDisplayName(user, DisplayType.RealName) : null))
		.filter((name): name is string => name !== null);
}

async function fillRealNamesForPetitions(petitions: Petition[]): Promise<Petition[]> {
	const petitionerIds = petitions.map((petition) => petition.petitionerId);
	const responderIds = petitions
		.filter((petition) => petition.responderId !== null)
		.map((petition) => petition.responderId as UserId);

	const petitioners = await UserService.findUsersByIds(petitionerIds);
	const responders = await UserService.findUsersByIds(responderIds);

	const petitionerByUserId = new Map(
		petitionerIds.map((id, index) => [id.toString(), petitioners[index]])
	);
	const responderByUserId = new Map(
		responderIds.map((id, index) => [id.toString(), responders[index]])
	);

	return petitions.map((petition) => {
		const petitioner = petitionerByUserId.get(petition.petitionerId.toString());
		const responder = responderByUserId.get((petition.responderId ?? '').toString());

		return {
			...petition,
			petitionerName: petitioner ? createDisplayName(petitioner, DisplayType.RealName) : null,
			responderName: responder ? createDisplayName(responder, DisplayType.RealName) : null
		};
	});
}

export async function getPetitionPageView(page: number, user: User) {
	const limit = 10;
	const skip = (page - 1) * limit;

	const petitionsResult = await PetitionService.getPetitionPage(limit, skip);
	const petitions = await fillRealNamesForPetitions(petitionsResult.items);

	const filePresenceEntries = await Promise.all(
		petitions.map(async (petition) => {
			const files = await FileMetaService.getFileMetasByArticleId(petition._id);
			return [
				petition._id.toString(),
				{
					hasImage: files.some((file) => file.mime.startsWith('image/')),
					hasFile: files.some((file) => !file.mime.startsWith('image/'))
				}
			] as const;
		})
	);

	return {
		petitions,
		filePresence: Object.fromEntries(filePresenceEntries) as FilePresence,
		hasPrev: petitionsResult.hasPrev,
		hasNext: petitionsResult.hasNext,
		canCreatePetition: hasCapability(user, 'petition.write')
	};
}

export async function getPetitionDetail(
	petitionId: PetitionId,
	user: User,
	options?: { incrementView?: boolean }
) {
	if (options?.incrementView !== false) {
		await PetitionService.viewPetitionById(petitionId);
	}

	const petitionRaw = await PetitionService.getPetitionById(petitionId);
	const petition = (await fillRealNamesForPetitions([petitionRaw]))[0];
	const signersNames = await getSignersRealNamesByPetition(petition);
	const files = await FileMetaService.getFileMetasByArticleId(petitionId);

	return {
		petition,
		signersNames,
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
		const petition = await PetitionService.createPetition(
			{
				title,
				content,
				petitionerId: petitioner._id
			},
			petitioner
		);
		await FileMetaService.linkArticleToFiles(fileIds, petition._id);
		return petition;
	});
}

export async function deletePetitionById(petitionId: PetitionId, user: User) {
	return await mongoose.connection.transaction(async () => {
		await PetitionService.deletePetitionById(petitionId, user);
		await FileMetaService.unlinkArticleFromAllFiles(petitionId);
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
	return await PetitionService.responseToPetitionById(petitionId, user, response);
}

export async function editPetitionResponse(petitionId: PetitionId, user: User, response: string) {
	return await PetitionService.reviseResponseById(petitionId, user, response);
}

export async function deletePetitionResponse(petitionId: PetitionId, user: User) {
	return await PetitionService.deleteResponseById(petitionId, user);
}
