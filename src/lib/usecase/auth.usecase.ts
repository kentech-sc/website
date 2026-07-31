import type { Profile, User } from '$lib/types/user.type.js';

import { transaction } from '$lib/server/db.js';
import * as ThrottleService from '$lib/services/throttle.service.js';
import * as UserService from '$lib/services/user.service.js';

function isDuplicateKeyError(error: unknown): boolean {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		typeof error.code === 'string' &&
		error.code === '23505'
	);
}

export async function getOrCreateUser(profile: Profile): Promise<User> {
	const user = await UserService.findUserByIdentity(profile.issuer, profile.subject);
	if (user) {
		if (user.deletedAt || (user.email === profile.email && user.realName === profile.name)) {
			return user;
		}
		return await transaction(async () => await UserService.syncUserProfile(user, profile));
	}

	try {
		return await transaction(async () => {
			const createdUser = await UserService.signupUser(profile);
			await ThrottleService.createUserThrottles(createdUser.id);
			return createdUser;
		});
	} catch (error) {
		if (!isDuplicateKeyError(error)) throw error;

		const existingUser = await UserService.findUserByIdentity(profile.issuer, profile.subject);
		if (existingUser) return existingUser;
		throw error;
	}
}

// Temporary helper: run manually once before production, then remove it.
export async function backfillMissingLegacyUserThrottles(): Promise<number> {
	const userIds = await UserService.findUserIds();
	return await ThrottleService.backfillMissingThrottles(userIds);
}
