import type { Petition } from '../petition/types';
import type { UserId } from '$lib/user/types';
import UserService from '$lib/user/service';

export default class PetitionApplication {
	static async getSignersRealNamesByPetition(petition: Petition): Promise<Array<string | null>> {
		const users = await UserService.getUsersByIds(petition.signedBy);
		return users.map((user) => user?.realName ?? null);
	}

	static async fillRealNamesForPetitions(petitions: Petition[]): Promise<Petition[]> {
		// 모든 petitionerId / responderId 모으기
		const petitionerIds = petitions.map((p) => p.petitionerId);
		const responderIds = petitions
			.filter((p) => p.responderId !== null)
			.map((p) => p.responderId as UserId);

		// 각각 userId -> User 매핑
		const petitioners = await UserService.getUsersByIds(petitionerIds);
		const responders = await UserService.getUsersByIds(responderIds);

		const petitionerByUserId = new Map(
			petitionerIds.map((id, i) => [id.toString(), petitioners[i]])
		);
		const responderByUserId = new Map(responderIds.map((id, i) => [id.toString(), responders[i]]));

		// Petition 배열 갱신
		for (const petition of petitions) {
			petition.petitionerName =
				petitionerByUserId.get(petition.petitionerId.toString())?.realName ?? null;

			petition.responderName = petition.responderId
				? (responderByUserId.get(petition.responderId.toString())?.realName ?? null)
				: null;
		}

		return petitions;
	}
}
