import type { User, UserCreate, UserUpdate, UserId } from './types';

import UserModel from './model.js';

export default class UserRepository {
	static async createUser(user: UserCreate): Promise<User> {
		return (await UserModel.create(user)).toObject();
	}

	static async getUserById(userId: UserId): Promise<User | null> {
		return await UserModel.findOne({ _id: userId }).lean();
	}

	static async getUserByEmail(email: string): Promise<User | null> {
		return await UserModel.findOne({ email }).lean();
	}

	static async getUserByRealName(realName: string): Promise<User | null> {
		return await UserModel.findOne({ realName }).lean();
	}

	static async getUserByNickname(nickname: string): Promise<User | null> {
		return await UserModel.findOne({ nickname }).lean();
	}

	static async getUsersByIds(userIds: UserId[]): Promise<Array<User | null>> {
		const users = await UserModel.find({ _id: { $in: userIds } }).lean();

		const userById = new Map<string, User>();
		for (const user of users) {
			userById.set(user._id.toString(), user);
		}

		return userIds.map((userId) => userById.get(userId.toString()) ?? null);
	}

	static async getUsersByEmails(emails: string[]): Promise<Array<User | null>> {
		const users = await UserModel.find({ email: { $in: emails } }).lean();

		const userByEmail = new Map<string, User>();
		for (const user of users) {
			userByEmail.set(user.email, user);
		}

		return emails.map((email) => userByEmail.get(email) ?? null);
	}

	static async getUsersByRealNames(realNames: string[]): Promise<Array<User | null>> {
		const users = await UserModel.find({ realName: { $in: realNames } }).lean();

		const userByRealName = new Map<string, User>();
		for (const user of users) {
			userByRealName.set(user.realName, user);
		}

		return realNames.map((realName) => userByRealName.get(realName) ?? null);
	}

	static async getUsersByNicknames(nicknames: string[]): Promise<Array<User | null>> {
		const users = await UserModel.find({ nickname: { $in: nicknames } }).lean();

		const userByNickname = new Map<string, User>();
		for (const user of users) {
			userByNickname.set(user.nickname, user);
		}

		return nicknames.map((nickname) => userByNickname.get(nickname) ?? null);
	}

	static async updateUserById(userId: UserId, user: UserUpdate): Promise<User | null> {
		return await UserModel.findOneAndUpdate({ _id: userId }, user, { new: true }).lean();
	}

	static async deleteUserByEmail(email: string): Promise<User | null> {
		return await UserModel.findOneAndDelete({ email }).lean();
	}
}
