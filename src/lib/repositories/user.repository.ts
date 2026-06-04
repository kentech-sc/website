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

// export async function getUsersByRealName(realName: string): Promise<UserEntity[]> {
// 	return await UserModel.find({ realName }).lean();
// }

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

// export async function findUsersByEmails(emails: string[]): Promise<Array<UserEntity | null>> {
// 	const users = await UserModel.find({ email: { $in: emails } }).lean();

// 	const userByEmail = new Map<string, UserEntity>();
// 	for (const user of users) {
// 		userByEmail.set(user.email, user);
// 	}

// 	return emails.map((email) => userByEmail.get(email) ?? null);
// }

// export async function findUsersByNicknames(nicknames: string[]): Promise<Array<UserEntity | null>> {
// 	const users = await UserModel.find({ nickname: { $in: nicknames } }).lean();

// 	const userByNickname = new Map<string, UserEntity>();
// 	for (const user of users) {
// 		userByNickname.set(user.nickname, user);
// 	}

// 	return nicknames.map((nickname) => userByNickname.get(nickname) ?? null);
// }

export async function updateUserById(userId: UserId, user: UserUpdate): Promise<UserEntity | null> {
	return toPojo<UserEntity | null>(
		await UserModel.findOneAndUpdate({ _id: userId }, user, { new: true }).lean()
	);
}

export async function incrementUserPointsById(
	userId: UserId,
	increment: number
): Promise<UserEntity | null> {
	return toPojo<UserEntity | null>(
		await UserModel.findOneAndUpdate(
			{ _id: userId },
			{ $inc: { points: increment } },
			{ returnDocument: 'after' }
		).lean()
	);
}

// 탈퇴 처리: id와 group을 제외한 필드들을 탈퇴한 사용자임을 명시하는 값으로 변경
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
