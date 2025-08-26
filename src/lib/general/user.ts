import type { UserId } from '$lib/user/types.js';
import UserController from '$lib/user/controller.js';

export async function fillUserNames<T extends { userId: UserId }>(arr: T[]): Promise<T[]> {
	const userIdArr = arr.map((item) => item.userId);
	const userArr = await UserController.getUsersByUserIdArr(userIdArr);
	const userNameMap = new Map<string, string>();
	for (const user of userArr) {
		if (!user) continue;
		userNameMap.set(user._id.toString(), user.name);
	}
	return arr.map((item) => ({
		...item,
		userName: userNameMap.get(item.userId.toString()) ?? '???'
	}));
}
