import type { UserEntity, UserCreate, UserUpdate, UserId } from '$lib/types/user.type.js';

import { UserModel } from '$lib/models/user.model.js';
import { toPojo } from '$lib/shared/utils.js';

export async function createUser(user: UserCreate): Promise<UserEntity> {
	return toPojo<UserEntity>((await UserModel.create(user)).toObject());
}

export async function findUserById(userId: UserId): Promise<UserEntity | null> {
	return toPojo<UserEntity | null>(await UserModel.findOne({ _id: userId }).lean());
}

export async function findUserByEmail(email: string): Promise<UserEntity | null> {
	return toPojo<UserEntity | null>(await UserModel.findOne({ email }).lean());
}

export async function findUserByNickname(nickname: string): Promise<UserEntity | null> {
	return toPojo<UserEntity | null>(await UserModel.findOne({ nickname }).lean());
}

export async function findUsersByIds(userIds: UserId[]): Promise<Array<UserEntity | null>> {
	const users = toPojo<UserEntity[]>(await UserModel.find({ _id: { $in: userIds } }).lean());

	const userIdToUser = new Map<string, UserEntity>();
	for (const user of users) {
		userIdToUser.set(user._id, user);
	}

	return toPojo<Array<UserEntity | null>>(
		userIds.map((userId) => userIdToUser.get(userId) ?? null)
	);
}

export async function updateUserById(userId: UserId, user: UserUpdate): Promise<UserEntity | null> {
	return toPojo<UserEntity | null>(
		await UserModel.findOneAndUpdate({ _id: userId }, user, { new: true }).lean()
	);
}

// 탈퇴 처리: 핵심 식별자 외 필드를 탈퇴 사용자 값으로 치환한다.
export async function deleteUserById(userId: UserId): Promise<boolean> {
	const deletedUserUpdate = {
		email: `deleted_${userId}@deleted.com`,
		realName: '탈퇴한 사용자',
		nickname: `deleted_${userId}`,
		deletedAt: new Date(),
		blockedUntil: null
	};
	const deletedUser = await UserModel.findOneAndUpdate({ _id: userId }, deletedUserUpdate).lean();
	return deletedUser !== null;
}
