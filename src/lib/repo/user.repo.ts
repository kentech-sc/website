import type { User, UserCreate, UserUpdate, UserId } from '$lib/types/user.type.js';

import UserModel from '$lib/models/user.model.js';

export async function createUser(user: UserCreate): Promise<User> {
	return (await UserModel.create(user)).toObject();
}

export async function getUserById(userId: UserId): Promise<User | null> {
	return await UserModel.findOne({ _id: userId }).lean();
}

export async function getUserByEmail(email: string): Promise<User | null> {
	return await UserModel.findOne({ email }).lean();
}

export async function getUsersByRealName(realName: string): Promise<User[]> {
	return await UserModel.find({ realName }).lean();
}

export async function getUserByNickname(nickname: string): Promise<User | null> {
	return await UserModel.findOne({ nickname }).lean();
}

export async function getUsersByIds(userIds: UserId[]): Promise<Array<User | null>> {
	const users = await UserModel.find({ _id: { $in: userIds } }).lean();

	const userById = new Map<string, User>();
	for (const user of users) {
		userById.set(user._id.toString(), user);
	}

	return userIds.map((userId) => userById.get(userId.toString()) ?? null);
}

export async function getUsersByEmails(emails: string[]): Promise<Array<User | null>> {
	const users = await UserModel.find({ email: { $in: emails } }).lean();

	const userByEmail = new Map<string, User>();
	for (const user of users) {
		userByEmail.set(user.email, user);
	}

	return emails.map((email) => userByEmail.get(email) ?? null);
}

// export async function getUsersByRealNames(realNames: string[]): Promise<Array<User | null>> {
// 	const users = await UserModel.find({ realName: { $in: realNames } }).lean();

// 	const userByRealName = new Map<string, User>();
// 	for (const user of users) {
// 		userByRealName.set(user.realName, user);
// 	}

// 	return realNames.map((realName) => userByRealName.get(realName) ?? null);
// }

export async function getUsersByNicknames(nicknames: string[]): Promise<Array<User | null>> {
	const users = await UserModel.find({ nickname: { $in: nicknames } }).lean();

	const userByNickname = new Map<string, User>();
	for (const user of users) {
		userByNickname.set(user.nickname, user);
	}

	return nicknames.map((nickname) => userByNickname.get(nickname) ?? null);
}

export async function updateUserById(userId: UserId, user: UserUpdate): Promise<User | null> {
	return await UserModel.findOneAndUpdate({ _id: userId }, user, { new: true }).lean();
}

export async function deleteUserByEmail(email: string): Promise<User | null> {
	return await UserModel.findOneAndDelete({ email }).lean();
}
