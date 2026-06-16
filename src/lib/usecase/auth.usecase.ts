import mongoose from 'mongoose';

import type { Profile, User } from '$lib/types/user.type.js';

import * as ThrottleService from '$lib/services/throttle.service.js';
import * as UserService from '$lib/services/user.service.js';

function isDuplicateKeyError(error: unknown): boolean {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		typeof error.code === 'number' &&
		error.code === 11000
	);
}

export async function getOrCreateUser(profile: Profile): Promise<User> {
	const user = await UserService.findUserById(profile.id);
	if (user) return user;

	try {
		return await mongoose.connection.transaction(async () => {
			const createdUser = await UserService.signupUser(profile);
			await ThrottleService.createUserThrottles(createdUser._id);
			return createdUser;
		});
	} catch (error) {
		if (!isDuplicateKeyError(error)) throw error;

		const existingUser = await UserService.findUserById(profile.id);
		if (existingUser) return existingUser;
		throw error;
	}
}

// Temporary helper: run manually once before production, then remove it.
export async function backfillMissingLegacyUserThrottles(): Promise<number> {
	const userIds = await UserService.findUserIds();
	return await ThrottleService.backfillMissingThrottles(userIds);
}
