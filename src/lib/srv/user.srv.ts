import type { User, UserId, UserUpdate } from '$lib/types/user.type.js';

import { UserGroup, DisplayType } from '$lib/types/user.type.js';

import * as UserRepository from '$lib/repo/user.repo.js';
import * as UserPerm from '$lib/perm/user.perm.js';

export async function getUserOrNullByEmail(email: string): Promise<User | null> {
	return await UserRepository.getUserByEmail(email);
}

export async function getUserByEmail(email: string): Promise<User> {
	const user = await UserRepository.getUserByEmail(email);
	if (!user) throw new Error('존재하지 않는 사용자입니다.');
	return user;
}

export async function getUsersByRealName(realName: string): Promise<User[]> {
	return await UserRepository.getUsersByRealName(realName);
}

export async function getUserOrNullByNickname(nickname: string): Promise<User | null> {
	return await UserRepository.getUserByNickname(nickname);
}

export async function getUserByNickname(nickname: string): Promise<User> {
	const user = await UserRepository.getUserByNickname(nickname);
	if (!user) throw new Error('존재하지 않는 사용자입니다.');
	return user;
}

export async function getUserById(userId: UserId): Promise<User> {
	const user = await UserRepository.getUserById(userId);
	if (!user) throw new Error('존재하지 않는 사용자입니다.');
	return user;
}

export async function getUsersByIds(userIds: UserId[]): Promise<Array<User | null>> {
	return await UserRepository.getUsersByIds(userIds);
}

// export async function signinUserByEmail(email: string): Promise<User> {
// 	// TODO: Will this function be used?
// 	const user = await this.getUserByEmail(email);

// 	// await LogRepository.setUserLogByEmailAndAction(email, 'signin', `name: ${user.name}`);
// 	return user;
// }

export async function signupUserByEmailAndRealName(email: string, realName: string): Promise<User> {
	let user = await getUserOrNullByEmail(email);
	if (user) throw new Error('이미 가입된 사용자입니다.');

	const nickname = email.split('@')[0];

	user = await UserRepository.createUser({
		email,
		realName,
		nickname,
		group: UserGroup.User,
		blockedUntil: null
	});

	return user;
}

// ============ Change user info =====================

export function isGroup(group: string): boolean {
	return (Object.values(UserGroup) as string[]).includes(group);
}

export async function updateUserById(userId: UserId, userUpdate: UserUpdate): Promise<User> {
	const user = await UserRepository.updateUserById(userId, userUpdate);
	if (!user) throw new Error('존재하지 않는 사용자입니다.');
	return user;
}

export async function changeNicknameByEmail(
	email: string,
	newNickname: string,
	operator: User
): Promise<User> {
	const target = await getUserByEmail(email);

	const isDuplicate = !!(await getUserOrNullByNickname(newNickname));
	if (!UserPerm.canChangeNickname(target, newNickname, operator, isDuplicate))
		throw new Error('이름 변경이 불가능합니다.');

	return await updateUserById(target._id, { nickname: newNickname });
}

export async function changeGroupByEmail(
	email: string,
	group: UserGroup,
	operator: User
): Promise<User> {
	const target = await getUserByEmail(email);

	if (!UserPerm.canChangeGroup(target, group, operator))
		throw new Error('그룹 변경이 불가능합니다.');

	return await updateUserById(target._id, { group });
}

export async function blockUserByEmail(
	email: string,
	operator: User,
	duration = 7 * 24 * 60 * 60 * 1000
): Promise<User> {
	const target = await getUserByEmail(email);

	if (!UserPerm.canBlockOrUnblockUser(target, operator)) throw new Error('차단이 불가능합니다.');

	return await updateUserById(target._id, { blockedUntil: new Date(Date.now() + duration) });
}

export async function unblockUserByEmail(email: string, operator: User): Promise<User> {
	const target = await getUserByEmail(email);

	if (!UserPerm.canBlockOrUnblockUser(target, operator))
		throw new Error('차단 해제가 불가능합니다.');

	return await updateUserById(target._id, { blockedUntil: null });
}

export async function removeUserByEmail(email: string): Promise<User> {
	const deletedUser = await UserRepository.deleteUserByEmail(email);
	if (!deletedUser) throw new Error('존재하지 않는 사용자입니다.');
	return deletedUser;
}

// ========= Fill display names ===============

export const AnonymousName = '익명의 켄텍인';

export async function createUserIdAndIdxMap<T extends { userId: UserId }>(arr: T[]) {
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

export function fillDisplayName(
	user: User,
	displayType: DisplayType,
	idxByUserId?: Map<string, number>
): string {
	if (displayType === DisplayType.Anonymous) {
		if (!idxByUserId) return AnonymousName;
		return `${AnonymousName} ${idxByUserId.get(user._id.toString())}`;
	} else if (displayType === DisplayType.RealName) {
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

export async function fillDisplayNamesByDisplayType<T extends { userId: UserId }>(
	arr: T[],
	displayType: DisplayType
): Promise<T[]> {
	const { userById, idxByUserId } = await createUserIdAndIdxMap(arr);
	return arr.map((item) => {
		const user = userById.get(item.userId.toString());

		if (!user) return { ...item, displayName: null };

		const displayName = fillDisplayName(user, displayType, idxByUserId);

		return {
			...item,
			displayName
		};
	});
}

export async function fillDisplayNames<T extends { userId: UserId; displayType: DisplayType }>(
	arr: T[],
	no_idx_for_anon = false
): Promise<T[]> {
	const { userById, idxByUserId } = await createUserIdAndIdxMap(arr);

	return arr.map((item) => {
		const user = userById.get(item.userId.toString());

		if (!user) return { ...item, displayName: null };

		const displayName = fillDisplayName(
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
