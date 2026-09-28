import type { User } from '$lib/types/user.type.js';

import * as StudentDataRepository from '$lib/repositories/student-data.repository.js';
import { transaction } from '$lib/server/db.js';
import * as UserService from '$lib/services/user.service.js';

export async function changeNickname(userId: string, nickname: string, operator: User) {
	return await UserService.changeNicknameById(userId, nickname, operator);
}

export async function changeResidence(gender: string, house: string, operator: User) {
	return await UserService.changeResidence(gender, house, operator);
}

export async function deleteUser(operator: User) {
	await transaction(async () => {
		await StudentDataRepository.deleteStudentData(operator.id);
		await UserService.deleteUser(operator);
	});
}
