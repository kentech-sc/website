import type { DisplayType, Group, User, UserId } from './types';

import UserController from './controller.js';
import type { ManagerResult } from '$lib/general/types';

export default class UserManager {
	static async getUserByEmail(email: string): Promise<ManagerResult<User | null>> {
		const user = await UserController.getUserByEmail(email);
		return { ok: true, value: user };
	}
	static async getUserByRealName(realName: string): Promise<ManagerResult<User | null>> {
		const user = await UserController.getUserByRealName(realName);
		return { ok: true, value: user };
	}
	static async getUserByNickname(nickname: string): Promise<ManagerResult<User | null>> {
		const user = await UserController.getUserByNickname(nickname);
		return { ok: true, value: user };
	}
	static async getUserByUserId(userId: UserId): Promise<ManagerResult<User | null>> {
		const user = await UserController.getUserByUserId(userId);
		return { ok: true, value: user };
	}

	static isGroup(group: string): boolean {
		const groupArr: string[] = ['none', 'any', 'guest', 'user', 'dev', 'manager', 'blocked'];
		return groupArr.includes(group);
	}

	static canChangeName(
		targetUser: User | null,
		operatorEmail: string,
		operatorGroup: Group
	): ManagerResult<void> {
		if (!targetUser) return { ok: false, error: '존재하지 않는 사용자입니다.' };
		if ((['blocked'] as Group[]).includes(operatorGroup))
			return { ok: false, error: '차단된 사용자는 이름을 변경할 수 없습니다.' };
		if (targetUser.email !== operatorEmail)
			return { ok: false, error: '이름 변경은 본인만 가능합니다.' };
		return { ok: true };
	}

	static canChangeGroup(targetUser: User | null, operatorGroup: Group): ManagerResult<void> {
		if (!targetUser) return { ok: false, error: '존재하지 않는 사용자입니다.' };
		if (!(['system', 'manager', 'dev'] as Group[]).includes(operatorGroup))
			return { ok: false, error: '그룹 변경 권한이 없습니다.' };
		if ((['system', 'dev'] as Group[]).includes(targetUser.group))
			return { ok: false, error: '시스템 및 개발자 그룹은 그룹을 변경할 수 없습니다.' };
		return { ok: true };
	}
	static async signinUserByEmail(email: string): Promise<ManagerResult<User | null>> {
		// TODO: Will this function be used?
		const user = await UserController.getUserByEmail(email);
		if (!user) return { ok: false, error: '존재하지 않는 사용자입니다.' };

		// await LogController.setUserLogByEmailAndAction(email, 'signin', `name: ${user.name}`);
		return { ok: true, value: user };
	}

	static async signupUserByEmailAndRealName(
		email: string,
		realName: string
	): Promise<ManagerResult<User>> {
		let user = await UserController.getUserByEmail(email);
		if (user) return { ok: false, error: '이미 가입된 사용자입니다.' };

		let nickname = realName;
		user = await UserController.getUserByNickname(nickname);
		while (user) {
			nickname = nickname + '_';
			user = await UserController.getUserByNickname(nickname);
		}

		user = await UserController.createUser({ email, realName, nickname, group: 'user' });

		return { ok: true, value: user };
	}

	static async changeNicknameByEmail(
		email: string,
		newNickname: string,
		operator: User
	): Promise<ManagerResult<void>> {
		const user = await UserController.getUserByEmail(email);
		if (!user) return { ok: false, error: '존재하지 않는 사용자입니다.' };

		const res = this.canChangeName(user, operator.email, operator.group);
		if (!res.ok) return res;

		await UserController.updateUserByUserId(user._id, { nickname: newNickname });

		return { ok: true };
	}

	static async #changeGroupByUser(
		user: User | null,
		group: Group,
		operator: User
	): Promise<ManagerResult<void>> {
		if (!user) return { ok: false, error: '존재하지 않는 사용자 입니다.' };
		const res = this.canChangeGroup(user, operator.group);
		if (!res.ok) return res;

		await UserController.updateUserByUserId(user._id, { group });
		return { ok: true };
	}

	static async changeGroupByEmail(
		email: string,
		group: Group,
		operator: User
	): Promise<ManagerResult<void>> {
		if (!(['user', 'manager'] as Group[]).includes(group))
			return { ok: false, error: "The group of user can only be 'user' or 'manager'!" };
		const user = await UserController.getUserByEmail(email);
		const res = await this.#changeGroupByUser(user, group, operator);
		return res;
	}

	static async changeGroupByUserId(
		userId: UserId,
		group: Group,
		operator: User
	): Promise<ManagerResult<void>> {
		if (!(['user', 'blocked'] as Group[]).includes(group))
			return { ok: false, error: 'This function is made for blocking and unblocking user!' };
		const user = await UserController.getUserByUserId(userId);
		const res = await this.#changeGroupByUser(user, group, operator);
		return res;
	}

	static async removeUserByEmail(email: string): Promise<ManagerResult<void>> {
		const user = await UserController.getUserByEmail(email);
		if (!user) return { ok: false, error: '존재하지 않는 사용자입니다.' };

		await UserController.deleteUserByUserEmail(email);

		return { ok: true };
	}

	static async #createUserIdAndIdxMap<T extends { userId: UserId }>(arr: T[]) {
		const userIdArr = arr.map((item) => item.userId);
		const userArr = await UserController.getUsersByUserIdArr(userIdArr);
		const userIdMap = new Map<string, User>();
		const userIdxMap = new Map<string, number>();

		let idx = 1;
		for (const user of userArr) {
			if (!user) continue;
			if (userIdMap.has(user._id.toString())) continue;
			userIdMap.set(user._id.toString(), user);
			userIdxMap.set(user._id.toString(), idx++);
		}

		return { userIdMap, userIdxMap };
	}

	static async fillDisplayNamesByDisplayType<T extends { userId: UserId }>(
		arr: T[],
		displayType: DisplayType
	): Promise<T[]> {
		const { userIdMap, userIdxMap } = await this.#createUserIdAndIdxMap(arr);
		return arr.map((item) => {
			const user = userIdMap.get(item.userId.toString());

			let displayName = '???';

			if (!user) {
				displayName = '???';
			} else if (displayType === 'anonymous') {
				displayName = `익명의 켄텍인 ${userIdxMap.get(item.userId.toString())}`;
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
		const { userIdMap, userIdxMap } = await this.#createUserIdAndIdxMap(arr);

		return arr.map((item) => {
			const user = userIdMap.get(item.userId.toString());

			let displayName = '???';

			if (!user) {
				displayName = '???';
			} else if (item.displayType === 'anonymous') {
				displayName = no_idx_for_anon
					? '익명의 켄텍인'
					: `익명의 켄텍인 ${userIdxMap.get(item.userId.toString())}`;
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
