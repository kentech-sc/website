import type { Profile, User } from '$lib/types/user.type.js';

import * as UserService from '$lib/services/user.service.js';

export async function getOrCreateUser(profile: Profile): Promise<User> {
	const user = await UserService.findUserById(profile.id);
	if (user) return user;
	return await UserService.signupUser(profile);
}
