import type { Group, User, UserId } from './type';
import type { WikiResponse } from '../general';

import UserController from './controller.js';

export default class UserManager {
	static async getUserByEmail(email: string): Promise<User | null> {
		return await UserController.getUserByEmail(email);
	}
	static async getUserByName(name: string): Promise<User | null> {
		return await UserController.getUserByName(name);
	}
	static async getUserByUserId(userId: UserId): Promise<User | null> {
		return await UserController.getUserByUserId(userId);
	}

	static isGroup(group: string): boolean {
		const groupArr: string[] = ['none', 'any', 'guest', 'user', 'dev', 'manager', 'blocked'];
		return groupArr.includes(group);
	}

	static canChangeName(
		targetUser: User | null,
		operatorEmail: string,
		operatorGroup: Group
	): WikiResponse<void> {
		if (!targetUser) return { ok: false, reason: '존재하지 않는 사용자입니다.' };
		if ((['blocked'] as Group[]).includes(operatorGroup))
			return { ok: false, reason: '차단된 사용자는 이름을 변경할 수 없습니다.' };
		if (targetUser.email !== operatorEmail)
			return { ok: false, reason: '이름 변경은 본인만 가능합니다.' };
		return { ok: true };
	}

	static canChangeGroup(targetUser: User | null, operatorGroup: Group): WikiResponse<void> {
		if (!targetUser) return { ok: false, reason: '존재하지 않는 사용자입니다.' };
		if (!(['system', 'manager', 'dev'] as Group[]).includes(operatorGroup))
			return { ok: false, reason: '그룹 변경 권한이 없습니다.' };
		if ((['system', 'dev'] as Group[]).includes(targetUser.group))
			return { ok: false, reason: '시스템 및 개발자 그룹은 그룹을 변경할 수 없습니다.' };
		return { ok: true };
	}
	static async signinUserByEmail(email: string): Promise<WikiResponse<User | null>> {
		// TODO: Will this function be used?
		const user = await UserController.getUserByEmail(email);
		if (!user) return { ok: false, reason: '존재하지 않는 사용자입니다.' };

		// await LogController.setUserLogByEmailAndAction(email, 'signin', `name: ${user.name}`);
		return { ok: true, value: user };
	}

	static async signupUserByEmailAndName(email: string, name: string): Promise<WikiResponse<User>> {
		let user = await UserController.getUserByEmail(email);
		if (user) return { ok: false, reason: '이미 가입된 사용자입니다.' };

		user = await UserController.getUserByName(name);
		while (user) {
			name = name + '_';
			user = await UserController.getUserByName(name);
		}

		user = await UserController.setUser({ email, name, group: 'user' });

		return { ok: true, value: user };
	}

	static async changeNameByName(
		userName: string,
		newName: string,
		operator: User
	): Promise<WikiResponse<void>> {
		const user = await UserController.getUserByName(userName);
		if (!user) return { ok: false, reason: '존재하지 않는 사용자입니다.' };

		const res = this.canChangeName(user, operator.email, operator.group);
		if (!res.ok) return res;

		await UserController.updateUserByUserId(user._id, { name: newName });

		return { ok: true };
	}

	static async #changeGroupByUser(
		user: User | null,
		group: Group,
		operator: User
	): Promise<WikiResponse<void>> {
		if (!user) return { ok: false, reason: '존재하지 않는 사용자 입니다.' };
		const res = this.canChangeGroup(user, operator.group);
		if (!res.ok) return res;

		await UserController.updateUserByUserId(user._id, { group });
		return { ok: true };
	}

	static async changeGroupByName(
		userName: string,
		group: Group,
		operator: User
	): Promise<WikiResponse<void>> {
		if (!(['user', 'manager'] as Group[]).includes(group))
			return { ok: false, reason: "The group of user can only be 'user' or 'manager'!" };
		const user = await UserController.getUserByName(userName);
		const res = await this.#changeGroupByUser(user, group, operator);
		return res;
	}

	static async changeGroupByUserId(
		userId: UserId,
		group: Group,
		operator: User
	): Promise<WikiResponse<void>> {
		if (!(['user', 'blocked'] as Group[]).includes(group))
			return { ok: false, reason: 'This function is made for blocking and unblocking user!' };
		const user = await UserController.getUserByUserId(userId);
		const res = await this.#changeGroupByUser(user, group, operator);
		return res;
	}

	static async removeUserByEmail(email: string): Promise<WikiResponse<void>> {
		const user = await UserController.getUserByEmail(email);
		if (!user) return { ok: false, reason: '존재하지 않는 사용자입니다.' };

		await UserController.deleteUserByUserEmail(email);

		return { ok: true };
	}
}
