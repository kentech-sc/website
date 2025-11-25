import type { DisplayType, Group, User, UserId, UserUpdate } from './types';

import UserRepository from './repository.js';

export default class UserService {
	static async getUserOrNullByEmail(email: string): Promise<User | null> {
		return await UserRepository.getUserByEmail(email);
	}

	static async getUserByEmail(email: string): Promise<User> {
		const user = await UserRepository.getUserByEmail(email);
		if (!user) throw new Error('존재하지 않는 사용자입니다.');
		return user;
	}

	static async getUsersByRealName(realName: string): Promise<User[]> {
		return await UserRepository.getUsersByRealName(realName);
	}

	static async getUserOrNullByNickname(nickname: string): Promise<User | null> {
		return await UserRepository.getUserByNickname(nickname);
	}

	static async getUserByNickname(nickname: string): Promise<User> {
		const user = await UserRepository.getUserByNickname(nickname);
		if (!user) throw new Error('존재하지 않는 사용자입니다.');
		return user;
	}

	static async getUserById(userId: UserId): Promise<User> {
		const user = await UserRepository.getUserById(userId);
		if (!user) throw new Error('존재하지 않는 사용자입니다.');
		return user;
	}

	static async getUsersByIds(userIds: UserId[]): Promise<Array<User | null>> {
		return await UserRepository.getUsersByIds(userIds);
	}

	// static async signinUserByEmail(email: string): Promise<User> {
	// 	// TODO: Will this function be used?
	// 	const user = await this.getUserByEmail(email);

	// 	// await LogRepository.setUserLogByEmailAndAction(email, 'signin', `name: ${user.name}`);
	// 	return user;
	// }

	static async signupUserByEmailAndRealName(email: string, realName: string): Promise<User> {
		let user = await this.getUserOrNullByEmail(email);
		if (user) throw new Error('이미 가입된 사용자입니다.');

		const nickname = email.split('@')[0];

		user = await UserRepository.createUser({
			email,
			realName,
			nickname,
			group: 'user',
			blockedUntil: null
		});

		return user;
	}

	// ============ Change user info =====================

	static isGroup(group: string): boolean {
		const groups: string[] = ['none', 'any', 'guest', 'user', 'dev', 'manager'];
		return groups.includes(group);
	}

	static async canChangeNickname(
		targetUser: User,
		newNickname: string,
		operatorUser: User
	): Promise<boolean> {
		if (
			!(
				targetUser.email === operatorUser.email ||
				(['dev', 'manager'] as Group[]).includes(operatorUser.group)
			)
		)
			throw new Error('이름 변경은 본인만 가능합니다.');
		if (newNickname.length < 4) throw new Error('별명은 4자 이상이어야 합니다.');
		if (targetUser.nickname === newNickname) throw new Error('변경 사항이 없습니다.');
		const user = await this.getUserOrNullByNickname(newNickname);
		if (user) throw new Error('이미 같은 별명의 사용자가 있습니다.');
		return true;
	}

	static canChangeGroup(targetUser: User, newGroup: Group, operatorUser: User): boolean {
		if (!(['user', 'moderator', 'manager'] as Group[]).includes(newGroup))
			throw new Error('그룹 변경은 "user", "moderator", "manager"로만 가능합니다.');

		if (!(['manager', 'dev'] as Group[]).includes(operatorUser.group))
			throw new Error('그룹 변경 권한이 없습니다.');

		if ((['dev'] as Group[]).includes(targetUser.group))
			throw new Error('개발자의 그룹은 변경할 수 없습니다.');

		return true;
	}

	static canBlockOrUnblockUser(targetUser: User, operatorUser: User): boolean {
		if (['manager', 'dev'].includes(targetUser.group))
			throw new Error('관리자나 개발자는 차단 또는 차단 해제할 수 없습니다.');
		if (!(['manager', 'dev'] as Group[]).includes(operatorUser.group))
			throw new Error('차단 또는 차단 해제 권한이 없습니다.');
		return true;
	}

	static async updateUserById(userId: UserId, userUpdate: UserUpdate): Promise<User> {
		const user = await UserRepository.updateUserById(userId, userUpdate);
		if (!user) throw new Error('존재하지 않는 사용자입니다.');
		return user;
	}

	static async changeNicknameByEmail(
		email: string,
		newNickname: string,
		operator: User
	): Promise<User> {
		const target = await this.getUserByEmail(email);

		if (!(await this.canChangeNickname(target, newNickname, operator)))
			throw new Error('이름 변경이 불가능합니다.');

		return await this.updateUserById(target._id, { nickname: newNickname });
	}

	static async changeGroupByEmail(email: string, group: Group, operator: User): Promise<User> {
		const target = await this.getUserByEmail(email);

		if (!this.canChangeGroup(target, group, operator)) throw new Error('그룹 변경이 불가능합니다.');

		return await this.updateUserById(target._id, { group });
	}

	static async blockUserByEmail(
		email: string,
		operator: User,
		duration = 7 * 24 * 60 * 60 * 1000
	): Promise<User> {
		const target = await this.getUserByEmail(email);

		if (!this.canBlockOrUnblockUser(target, operator)) throw new Error('차단이 불가능합니다.');

		return await this.updateUserById(target._id, { blockedUntil: new Date(Date.now() + duration) });
	}

	static async unblockUserByEmail(email: string, operator: User): Promise<User> {
		const target = await this.getUserByEmail(email);

		if (!this.canBlockOrUnblockUser(target, operator)) throw new Error('차단 해제가 불가능합니다.');

		return await this.updateUserById(target._id, { blockedUntil: null });
	}

	static async removeUserByEmail(email: string): Promise<User> {
		const deletedUser = await UserRepository.deleteUserByEmail(email);
		if (!deletedUser) throw new Error('존재하지 않는 사용자입니다.');
		return deletedUser;
	}

	// ========= Fill display names ===============

	static async #createUserIdAndIdxMap<T extends { userId: UserId }>(arr: T[]) {
		const userIds = arr.map((item) => item.userId);
		const users = await UserRepository.getUsersByIds(userIds);
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

	static fillDisplayName(
		user: User,
		displayType: DisplayType,
		idxByUserId?: Map<string, number>
	): string {
		if (displayType === 'anonymous') {
			if (!idxByUserId) return '익명의 켄텍인';
			return `익명의 켄텍인 ${idxByUserId.get(user._id.toString())}`;
		} else if (displayType === 'realName') {
			const id = user.email.split('@')[0];
			if (id.length >= 8) {
				return `${user[displayType]} (${id.slice(0, 4) + '****'})`;
			} else {
				return `${user[displayType]} (${id.slice(0, id.length - 4) + '****'})`;
			}
		} else {
			return user[displayType];
		}
	}

	static async fillDisplayNamesByDisplayType<T extends { userId: UserId }>(
		arr: T[],
		displayType: DisplayType
	): Promise<T[]> {
		const { userById, idxByUserId } = await this.#createUserIdAndIdxMap(arr);
		return arr.map((item) => {
			const user = userById.get(item.userId.toString());

			if (!user) return { ...item, displayName: null };

			const displayName = this.fillDisplayName(user, displayType, idxByUserId);

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

			if (!user) return { ...item, displayName: null };

			const displayName = this.fillDisplayName(
				user,
				item.displayType,
				no_idx_for_anon ? undefined : idxByUserId
			);

			return {
				...item,
				displayName
			};
		});
	}
}
