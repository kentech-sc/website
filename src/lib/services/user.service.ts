import type { Profile, User, UserId, UserUpdate } from '$lib/types/user.type.js';
import { DisplayType, UserGroup, type UserGroup as UserGroupType } from '$lib/types/user.type.js';

import { APP_ERROR } from '$lib/shared/rule.js';
import { ANONYMOUS_NAME, createDisplayName } from '$lib/shared/utils.js';
import { AppError, assertRule } from '$lib/server/errors.js';

import * as UserRepository from '$lib/repositories/user.repository.js';
import * as UserRule from '$lib/rules/user.rule.js';

export { ANONYMOUS_NAME };

export async function findUserById(userId: UserId): Promise<User | null> {
	return await UserRepository.findUserById(userId);
}

export async function findUserByEmail(email: string): Promise<User | null> {
	return await UserRepository.findUserByEmail(email);
}

export async function getUserByEmail(email: string): Promise<User> {
	const user = await UserRepository.findUserByEmail(email);
	if (!user) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 사용자입니다.');
	return user;
}

export async function findUserByNickname(nickname: string): Promise<User | null> {
	return await UserRepository.findUserByNickname(nickname);
}

export async function getUserById(userId: UserId): Promise<User> {
	const user = await UserRepository.findUserById(userId);
	if (!user) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 사용자입니다.');
	return user;
}

export async function findUsersByIds(userIds: UserId[]): Promise<Array<User | null>> {
	return await UserRepository.findUsersByIds(userIds);
}

export async function signupUser(profile: Profile): Promise<User> {
	const user = await findUserById(profile.id);
	if (user) throw new AppError(APP_ERROR.CONFLICT, '이미 가입한 사용자입니다.');

	const nickname = profile.email.split('@')[0];

	return await UserRepository.createUser({
		_id: profile.id,
		email: profile.email,
		realName: profile.name,
		nickname,
		group: UserGroup.User,
		points: 50
	});
}

export async function updateUserById(userId: UserId, userUpdate: UserUpdate): Promise<User> {
	const updatedUser = await UserRepository.updateUserById(userId, userUpdate);
	if (!updatedUser) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 사용자입니다.');
	return updatedUser;
}

export async function changeNicknameById(
	userId: UserId,
	newNickname: string,
	operator: User
): Promise<User> {
	const target = await getUserById(userId);
	const normalizedNickname = newNickname.trim();
	const isDuplicateNickname = (await findUserByNickname(normalizedNickname)) !== null;

	assertRule(UserRule.canChangeNickname(target, normalizedNickname, operator, isDuplicateNickname));

	return await updateUserById(target._id, { nickname: normalizedNickname });
}

export async function changeGroupByEmail(
	email: string,
	group: UserGroupType,
	operator: User
): Promise<User> {
	const target = await getUserByEmail(email);
	assertRule(UserRule.canChangeGroup(target, group, operator));
	return await updateUserById(target._id, { group });
}

export async function blockUserByEmail(
	email: string,
	operator: User,
	duration = 7 * 24 * 60 * 60 * 1000
): Promise<User> {
	const target = await getUserByEmail(email);
	assertRule(UserRule.canBlockOrUnblockUser(target, operator));

	return await updateUserById(target._id, {
		blockedUntil: new Date(Date.now() + duration).toISOString()
	});
}

export async function unblockUserByEmail(email: string, operator: User): Promise<User> {
	const target = await getUserByEmail(email);
	assertRule(UserRule.canBlockOrUnblockUser(target, operator));

	return await updateUserById(target._id, { blockedUntil: null });
}

export async function deleteUser(operator: User): Promise<void> {
	const target = await getUserById(operator._id);
	assertRule(UserRule.canDeleteUser(target, operator));

	const isDeleted = await UserRepository.deleteUserById(target._id);
	if (!isDeleted) throw new AppError(APP_ERROR.NOT_FOUND, '존재하지 않는 사용자입니다.');
}

async function createUserIdMaps<T extends { userId: UserId }>(items: T[]) {
	const userIds = items.map((item) => item.userId);
	const users = await UserRepository.findUsersByIds(userIds);

	const userIdToUser = new Map<string, User>();
	const userIdToIdx = new Map<string, number>();

	let idx = 1;
	for (const user of users) {
		if (!user) continue;
		if (userIdToUser.has(user._id)) continue;

		userIdToUser.set(user._id, user);
		userIdToIdx.set(user._id, idx++);
	}

	return { userIdToUser, userIdToIdx };
}

export async function fillDisplayNames<T extends { userId: UserId; displayType: DisplayType }>(
	items: T[],
	noIdxForAnon = false
): Promise<T[]> {
	const { userIdToUser, userIdToIdx } = await createUserIdMaps(items);

	return items.map((item) => {
		const user = userIdToUser.get(item.userId);
		if (!user) return { ...item, displayName: null };

		const displayName = createDisplayName(
			user,
			item.displayType,
			noIdxForAnon ? undefined : userIdToIdx
		);

		return {
			...item,
			displayName
		};
	});
}
