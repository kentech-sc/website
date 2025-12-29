import type { User, UserId, UserUpdate } from '$lib/types/user.type.js';

import { UserGroup, DisplayType } from '$lib/types/user.type.js';

import * as UserRepository from '$lib/repo/user.repo.js';
import * as UserRule from '$lib/rules/user.rule.js';

import { RuleError, SrvError } from '$lib/common/errors.js';

export async function getUserOrNullByEmail(email: string): Promise<User | null> {
	return await UserRepository.getUserByEmail(email);
}

export async function getUserByEmail(email: string): Promise<User> {
	const user = await UserRepository.getUserByEmail(email);
	if (!user) throw new SrvError('존재하지 않는 사용자입니다.');
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
	if (!user) throw new SrvError('존재하지 않는 사용자입니다.');
	return user;
}

export async function getUserById(userId: UserId): Promise<User> {
	const user = await UserRepository.getUserById(userId);
	if (!user) throw new SrvError('존재하지 않는 사용자입니다.');
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
	if (user) throw new RuleError('이미 가입된 사용자입니다.');

	const nickname = email.split('@')[0];

	user = await UserRepository.createUser({
		email,
		realName,
		nickname,
		group: UserGroup.User
	});

	return user;
}

// ============ Change user info =====================

export async function updateUserById(userId: UserId, userUpdate: UserUpdate): Promise<User> {
	const updatedUser = await UserRepository.updateUserById(userId, userUpdate);
	if (!updatedUser) throw new SrvError('존재하지 않는 사용자입니다.');
	return updatedUser;
}

export async function changeNicknameByEmail(
	email: string,
	newNickname: string,
	operator: User
): Promise<User> {
	const target = await getUserByEmail(email);

	const isDuplicate = (await getUserOrNullByNickname(newNickname)) !== null;
	if (!UserRule.canChangeNickname(target, newNickname, operator, isDuplicate))
		throw new RuleError('이름 변경이 불가능합니다.');

	return await updateUserById(target._id, { nickname: newNickname });
}

export async function changeGroupByEmail(
	email: string,
	group: UserGroup,
	operator: User
): Promise<User> {
	const target = await getUserByEmail(email);

	if (!UserRule.canChangeGroup(target, group, operator))
		throw new RuleError('그룹 변경이 불가능합니다.');

	return await updateUserById(target._id, { group });
}

export async function blockUserByEmail(
	email: string,
	operator: User,
	duration = 7 * 24 * 60 * 60 * 1000
): Promise<User> {
	const target = await getUserByEmail(email);

	if (!UserRule.canBlockOrUnblockUser(target, operator))
		throw new RuleError('차단이 불가능합니다.');

	return await updateUserById(target._id, { blockedUntil: new Date(Date.now() + duration) });
}

export async function unblockUserByEmail(email: string, operator: User): Promise<User> {
	const target = await getUserByEmail(email);

	if (!UserRule.canBlockOrUnblockUser(target, operator))
		throw new RuleError('차단 해제가 불가능합니다.');

	return await updateUserById(target._id, { blockedUntil: null });
}

export async function removeUserByEmail(email: string, user: User): Promise<void> {
	if (!UserRule.canRemoveUser(user)) throw new RuleError('삭제 권한이 없습니다.');

	const isDeleted = await UserRepository.deleteUserByEmail(email);
	if (!isDeleted) throw new SrvError('존재하지 않는 사용자입니다.');
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

export function createDisplayName(
	user: User,
	displayType: DisplayType,
	idxByUserId?: Map<string, number>
): string {
	switch (displayType) {
		case DisplayType.Anonymous: {
			if (!idxByUserId) return AnonymousName;
			const anonIdx = idxByUserId.get(user._id.toString());
			return `${AnonymousName} ${anonIdx}`; // ex. 익명의 켄텍인 1
		}

		case DisplayType.RealName: {
			const id = user.email.split('@')[0];
			const maskedId = id.slice(0, Math.min(id.length - 4, 4)) + '****';
			return `${user.realName} (${maskedId})`; // ex. 홍길동 (hong****)
		}

		case DisplayType.Nickname: {
			return user.nickname;
		}

		default:
			throw new SrvError('존재하지 않는 Display Type 입니다.');
	}
}

// export async function fillDisplayNamesByDisplayType<T extends { userId: UserId }>(
// 	arr: T[],
// 	displayType: DisplayType
// ): Promise<T[]> {
// 	const { userById, idxByUserId } = await createUserIdAndIdxMap(arr);
// 	return arr.map((item) => {
// 		const user = userById.get(item.userId.toString());

// 		if (!user) return { ...item, displayName: null };

// 		const displayName = createDisplayName(user, displayType, idxByUserId);

// 		return {
// 			...item,
// 			displayName
// 		};
// 	});
// }

export async function fillDisplayNames<T extends { userId: UserId; displayType: DisplayType }>(
	arr: T[],
	no_idx_for_anon = false
): Promise<T[]> {
	const { userById, idxByUserId } = await createUserIdAndIdxMap(arr);

	return arr.map((item) => {
		const user = userById.get(item.userId.toString());

		if (!user) return { ...item, displayName: null };

		const displayName = createDisplayName(
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
