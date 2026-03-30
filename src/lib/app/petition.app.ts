import mongoose from 'mongoose';

import type { Petition, PetitionId } from '$lib/types/petition.type.js';
import type { User, UserId } from '$lib/types/user.type.js';
import { DisplayType } from '$lib/types/user.type.js';

import * as UserService from '$lib/srv/user.srv.js';
import * as PetitionService from '$lib/srv/petition.srv.js';
import * as FileMetaService from '$lib/srv/file-meta.srv.js';

import type { FileId } from '$lib/types/file-meta.type';

export async function createPetition(
	title: string,
	content: string,
	petitioner: User,
	fileIds: FileId[]
) {
	return await mongoose.connection.transaction(async () => {
		await FileMetaService.confirmFilesByIds(fileIds);
		const petition = await PetitionService.createPetition({
			title,
			content,
			petitionerId: petitioner._id,
			files: fileIds
		});
		return petition;
	});
}

export async function deletePetitionById(petitionId: PetitionId, user: User) {
	return await mongoose.connection.transaction(async () => {
		const deletedPetition = await PetitionService.deletePetitionById(petitionId, user);
		const fileMetas = await FileMetaService.getFileMetasByIds(deletedPetition.files);
		const filteredFileIds = fileMetas
			.filter((fileMeta) => fileMeta !== null)
			.map((fileMeta) => fileMeta._id);
		await FileMetaService.deleteFilesByIds(filteredFileIds);
	});
}

export async function getSignersRealNamesByPetition(
	petition: Petition
): Promise<Array<string | null>> {
	const users = await UserService.getUsersByIds(petition.signedBy);
	return users.map((user) =>
		user ? UserService.createDisplayName(user, DisplayType.RealName) : null
	);
}

export async function fillRealNamesForPetitions(petitions: Petition[]): Promise<Petition[]> {
	// 모든 petitionerId / responderId 모으기
	const petitionerIds = petitions.map((p) => p.petitionerId);
	const responderIds = petitions
		.filter((p) => p.responderId !== null)
		.map((p) => p.responderId as UserId);

	// 각각 userId -> User 매핑
	const petitioners = await UserService.getUsersByIds(petitionerIds);
	const responders = await UserService.getUsersByIds(responderIds);

	const petitionerByUserId = new Map(petitionerIds.map((id, i) => [id.toString(), petitioners[i]]));
	const responderByUserId = new Map(responderIds.map((id, i) => [id.toString(), responders[i]]));

	// Petition 배열 갱신
	return petitions.map((petition) => {
		const petitioner = petitionerByUserId.get(petition.petitionerId.toString());
		const responder = responderByUserId.get((petition.responderId ?? '').toString());

		petition.petitionerName = petitioner
			? UserService.createDisplayName(petitioner, DisplayType.RealName)
			: null;
		petition.responderName = responder
			? UserService.createDisplayName(responder, DisplayType.RealName)
			: null;

		return petition;
	});
}
