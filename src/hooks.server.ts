// import * as Sentry from '@sentry/sveltekit';
import type { Handle, ServerInit } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

// import { AWS_BUCKET_NAME, AWS_ID, AWS_SECRET } from '$env/static/private';
import { MONGO_URI } from '$env/static/private';

import { handle as authenticationHandle } from './auth.js';
import DBManager from '$lib/general/db.js';
import UserManager from '$lib/user/manager.js';
import type { User } from '$lib/user/types.js';

async function getUser(email: string): Promise<User> {
	let user: User | null = await UserManager.getUserByEmail(email);
	if (user === null) {
		const res = await UserManager.signupUserByEmailAndName(email, email.split('@')[0]);
		if (!res.ok) throw new Error(res.error);
		user = res.value as User;
	}
	return user;
}

function checkEnv() {
	// if (PUBLIC_REQUIRE_LOGIN === undefined) {
	// 	throw new Error('Please set "PUBLIC_REQUIRE_LOGIN" in the .env file!');
	// }
	// if (PUBLIC_REQUIRE_LOGIN !== 'true' && PUBLIC_REQUIRE_LOGIN !== 'false') {
	// 	throw new Error('"PUBLIC_REQUIRE_LOGIN" must be "true" or "false"!');
	// }
	if (MONGO_URI === undefined) {
		throw new Error('Please set "MONGO_URI" in the .env file!');
	}
	// if (AWS_BUCKET_NAME === undefined) {
	// 	throw new Error('Please set "AWS_BUCKET_NAME" in the .env file!');
	// }
	// if (AWS_ID === undefined) {
	// 	throw new Error('Please set "AWS_ID" in the .env file!');
	// }
	// if (AWS_SECRET === undefined) {
	// 	throw new Error('Please set "AWS_SECRET" in the .env file!');
	// }
}

export const init: ServerInit = async () => {
	checkEnv();

	await DBManager.init(MONGO_URI);

	console.log('[Server Is Ready]');
};

const authorizationHandle: Handle = async ({ event, resolve }) => {
	const session = await event.locals.auth();

	if (session?.user?.email) {
		// Authorized
		if (event.url.pathname.startsWith('/signin')) {
			redirect(303, '/');
		}

		const user = await getUser(session?.user?.email);
		event.locals.user = user;

		return await resolve(event);
	} else {
		// Unauthorized
		if (event.url.pathname.startsWith('/signin')) {
			return await resolve(event);
		} else {
			redirect(303, '/signin');
		}
	}
};

// export const handleError: HandleServerError = Sentry.handleErrorWithSentry(
// 	async ({ error, event }) => {
// 		const fullTitle =
// 			event.params.fullTitle ||
// 			'사용자:' + event.params.userName ||
// 			'검색:' + event.params.query ||
// 			event.url.pathname;

// 		return {
// 			message: error instanceof Error ? error.message : '알 수 없는 에러',
// 			fullTitle
// 		};
// 	}
// );

export const handle = sequence(authenticationHandle, authorizationHandle);
