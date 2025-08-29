import type { User, UserCreate, UserUpdate, UserId } from './types';

import UserModel from './model.js';

export default class UserController {
	static async createUser(user: UserCreate): Promise<User> {
		return (await UserModel.create(user)).toObject();
	}

	static async getUserByUserId(userId: UserId): Promise<User | null> {
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

	static async getUsersByUserIdArr(userIdArr: UserId[]): Promise<Array<User | null>> {
		const userArr = await UserModel.find({ _id: { $in: userIdArr } }).lean();

		const userMap = new Map<string, User>();
		for (const user of userArr) {
			userMap.set(user._id.toString(), user);
		}

		return userIdArr.map((userId) => userMap.get(userId.toString()) ?? null);
	}

	static async getUsersByEmailArr(emailArr: string[]): Promise<Array<User | null>> {
		const userArr = await UserModel.find({ email: { $in: emailArr } }).lean();

		const userMap = new Map<string, User>();
		for (const user of userArr) {
			userMap.set(user.email, user);
		}

		return emailArr.map((email) => userMap.get(email) ?? null);
	}

	static async getUsersByRealNameArr(realNameArr: string[]): Promise<Array<User | null>> {
		const userArr = await UserModel.find({ realName: { $in: realNameArr } }).lean();

		const userMap = new Map<string, User>();
		for (const user of userArr) {
			userMap.set(user.realName, user);
		}

		return realNameArr.map((realName) => userMap.get(realName) ?? null);
	}

	static async getUsersByNicknameArr(nicknameArr: string[]): Promise<Array<User | null>> {
		const userArr = await UserModel.find({ nickname: { $in: nicknameArr } }).lean();

		const userMap = new Map<string, User>();
		for (const user of userArr) {
			userMap.set(user.nickname, user);
		}

		return nicknameArr.map((nickname) => userMap.get(nickname) ?? null);
	}

	static async updateUserByUserId(userId: UserId, user: UserUpdate): Promise<void> {
		await UserModel.updateOne({ _id: userId }, user);
	}

	static async deleteUserByUserEmail(email: string): Promise<void> {
		await UserModel.deleteOne({ email });
	}
}
