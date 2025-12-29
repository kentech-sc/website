import type { UserDoc, UserCreate, UserUpdate, UserId } from '$lib/types/user.type.js';

import { UserModel } from '$lib/models/user.model.js';

export async function createUser(user: UserCreate): Promise<UserDoc> {
	return (await UserModel.create(user)).toObject();
}

export async function getUserById(userId: UserId): Promise<UserDoc | null> {
	return await UserModel.findOne({ _id: userId }).lean();
}

export async function getUserByEmail(email: string): Promise<UserDoc | null> {
	return await UserModel.findOne({ email }).lean();
}

export async function getUsersByRealName(realName: string): Promise<UserDoc[]> {
	return await UserModel.find({ realName }).lean();
}

export async function getUserByNickname(nickname: string): Promise<UserDoc | null> {
	return await UserModel.findOne({ nickname }).lean();
}

export async function getUsersByIds(userIds: UserId[]): Promise<Array<UserDoc | null>> {
	const users = await UserModel.find({ _id: { $in: userIds } }).lean();

	const userById = new Map<string, UserDoc>();
	for (const user of users) {
		userById.set(user._id.toString(), user);
	}

	return userIds.map((userId) => userById.get(userId.toString()) ?? null);
}

export async function getUsersByEmails(emails: string[]): Promise<Array<UserDoc | null>> {
	const users = await UserModel.find({ email: { $in: emails } }).lean();

	const userByEmail = new Map<string, UserDoc>();
	for (const user of users) {
		userByEmail.set(user.email, user);
	}

	return emails.map((email) => userByEmail.get(email) ?? null);
}

export async function getUsersByNicknames(nicknames: string[]): Promise<Array<UserDoc | null>> {
	const users = await UserModel.find({ nickname: { $in: nicknames } }).lean();

	const userByNickname = new Map<string, UserDoc>();
	for (const user of users) {
		userByNickname.set(user.nickname, user);
	}

	return nicknames.map((nickname) => userByNickname.get(nickname) ?? null);
}

export async function updateUserById(userId: UserId, user: UserUpdate): Promise<UserDoc | null> {
	return await UserModel.findOneAndUpdate({ _id: userId }, user, { new: true }).lean();
}

export async function deleteUserByEmail(email: string): Promise<boolean> {
	const res = await UserModel.deleteOne({ email });
	return res.deletedCount > 0;
}
