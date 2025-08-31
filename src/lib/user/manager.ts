import type { DisplayType, Group, User, UserId } from './types';

import UserController from './controller.js';

export default class UserManager {
	static async getUserOrNullByEmail(email: string): Promise<User | null> {
		return await UserController.getUserByEmail(email);
	}

	static async getUserByEmail(email: string): Promise<User> {
		const user = await UserController.getUserByEmail(email);
		if (!user) throw new Error('존재하지 않는 사용자입니다.');
		return user;
	}
	static async getUserByRealName(realName: string): Promise<User> {
		const user = await UserController.getUserByRealName(realName);
		if (!user) throw new Error('존재하지 않는 사용자입니다.');
		return user;
	}
	static async getUserByNickname(nickname: string): Promise<User> {
		const user = await UserController.getUserByNickname(nickname);
		if (!user) throw new Error('존재하지 않는 사용자입니다.');
		return user;
	}
	static async getUserById(userId: UserId): Promise<User> {
		const user = await UserController.getUserById(userId);
		if (!user) throw new Error('존재하지 않는 사용자입니다.');
		return user;
	}

	static isGroup(group: string): boolean {
		const groups: string[] = ['none', 'any', 'guest', 'user', 'dev', 'manager', 'blocked'];
		return groups.includes(group);
	}

	static canChangeName(targetUser: User, operatorEmail: string, operatorGroup: Group): boolean {
		if ((['blocked'] as Group[]).includes(operatorGroup))
			throw new Error('차단된 사용자는 이름을 변경할 수 없습니다.');
		if (targetUser.email !== operatorEmail) throw new Error('이름 변경은 본인만 가능합니다.');
		return true;
	}

	static canChangeGroup(targetUser: User, operatorGroup: Group): boolean {
		if (!(['system', 'manager', 'dev'] as Group[]).includes(operatorGroup))
			throw new Error('그룹 변경 권한이 없습니다.');
		if ((['system', 'dev'] as Group[]).includes(targetUser.group))
			throw new Error('시스템 및 개발자 그룹은 그룹을 변경할 수 없습니다.');
		return true;
	}
	static async signinUserByEmail(email: string): Promise<User> {
		// TODO: Will this function be used?
		const user = await this.getUserByEmail(email);

		// await LogController.setUserLogByEmailAndAction(email, 'signin', `name: ${user.name}`);
		return user;
	}

	static async signupUserByEmailAndRealName(email: string, realName: string): Promise<User> {
		let user = await this.getUserOrNullByEmail(email);
		if (user) throw new Error('이미 가입된 사용자입니다.');

		let nickname = realName;
		user = await UserController.getUserByNickname(nickname);
		while (user) {
			nickname = nickname + '_';
			user = await UserController.getUserByNickname(nickname);
		}

		user = await UserController.createUser({ email, realName, nickname, group: 'user' });

		return user;
	}

	static async changeNicknameByEmail(
		email: string,
		newNickname: string,
		operator: User
	): Promise<void> {
		const user = await this.getUserByEmail(email);

		const res = this.canChangeName(user, operator.email, operator.group);
		if (!res) throw new Error('이름 변경은 본인만 가능합니다.');

		await UserController.updateUserById(user._id, { nickname: newNickname });
	}

	static async #changeGroupByUser(user: User, group: Group, operator: User): Promise<void> {
		const res = this.canChangeGroup(user, operator.group);
		if (!res) throw new Error('그룹 변경 권한이 없습니다.');

		await UserController.updateUserById(user._id, { group });
	}

	static async changeGroupByEmail(email: string, group: Group, operator: User): Promise<void> {
		if (!(['user', 'manager'] as Group[]).includes(group))
			throw new Error("The group of user can only be 'user' or 'manager'!");
		const user = await this.getUserByEmail(email);
		await this.#changeGroupByUser(user, group, operator);
	}

	static async changeGroupByUserId(userId: UserId, group: Group, operator: User): Promise<void> {
		if (!(['user', 'blocked'] as Group[]).includes(group))
			throw new Error('This function is made for blocking and unblocking user!');
		const user = await this.getUserById(userId);
		await this.#changeGroupByUser(user, group, operator);
	}

	static async removeUserByEmail(email: string): Promise<void> {
		const user = await this.getUserByEmail(email);
		if (!user) throw new Error('존재하지 않는 사용자입니다.');

		await UserController.deleteUserByEmail(email);
	}

	static async #createUserIdAndIdxMap<T extends { userId: UserId }>(arr: T[]) {
		const userIds = arr.map((item) => item.userId);
		const users = await UserController.getUsersByIds(userIds);
		const userById = new Map<string, User>();
		const idxByUserId = new Map<string, number>();

		let idx = 1;
		for (const user of users) {
			if (!user) continue;
			if (userById.has(user._id.toString())) continue;
			userById.set(user._id.toString(), user);
			idxByUserId.set(user._id.toString(), idx++);
		}

		return { userById, idxByUserId };
	}

	static async fillDisplayNamesByDisplayType<T extends { userId: UserId }>(
		arr: T[],
		displayType: DisplayType
	): Promise<T[]> {
		const { userById, idxByUserId } = await this.#createUserIdAndIdxMap(arr);
		return arr.map((item) => {
			const user = userById.get(item.userId.toString());

			let displayName = '???';

			if (!user) {
				displayName = '???';
			} else if (displayType === 'anonymous') {
				displayName = `익명의 켄텍인 ${idxByUserId.get(item.userId.toString())}`;
			} else {
				displayName = user[displayType];
			}

			return {
				...item,
				displayName
			};
		});
	}

	static async fillDisplayNames<T extends { userId: UserId; displayType: DisplayType }>(
		arr: T[],
		no_idx_for_anon = false
	): Promise<T[]> {
		const { userById, idxByUserId } = await this.#createUserIdAndIdxMap(arr);

		return arr.map((item) => {
			const user = userById.get(item.userId.toString());

			let displayName = '???';

			if (!user) {
				displayName = '???';
			} else if (item.displayType === 'anonymous') {
				displayName = no_idx_for_anon
					? '익명의 켄텍인'
					: `익명의 켄텍인 ${idxByUserId.get(item.userId.toString())}`;
			} else {
				displayName = user[item.displayType];
			}

			return {
				...item,
				displayName
			};
		});
	}
}
