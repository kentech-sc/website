// import * as Sentry from '@sentry/sveltekit';
import type { ActionResult, Handle, HandleServerError, ServerInit } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

// import { AWS_BUCKET_NAME, AWS_ID, AWS_SECRET } from '$env/static/private';
import { MONGO_URI } from '$env/static/private';

import { handle as authenticationHandle } from './auth.js';
import DBService from '$lib/general/db.js';
import UserService from '$lib/user/service.js';
import type { User } from '$lib/user/types.js';

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

	await DBService.init(MONGO_URI);

	console.log('[Server Is Ready]');
};

async function getUser(email: string, name: string): Promise<User> {
	const user = await UserService.getUserOrNullByEmail(email);
	if (!user) {
		return await UserService.signupUserByEmailAndRealName(email, name);
	} else {
		return user;
	}
}

const authorizationHandle: Handle = async ({ event, resolve }) => {
	const session = await event.locals.auth();

	if (session?.user?.email && session?.user?.name) {
		// Authorized
		if (event.url.pathname.startsWith('/signin')) {
			redirect(303, '/');
		}

		const user = await getUser(session?.user?.email, session?.user?.name?.split('/')[0]);
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

export const blockHandle: Handle = async ({ event, resolve }) => {
	const user = event.locals.user;

	if (user?.blockedUntil && user.blockedUntil > new Date()) {
		// form action 요청일 경우 차단
		if (event.request.method === 'POST') {
			const result: ActionResult = {
				type: 'error',
				status: 403,
				error: {
					message: '차단된 사용자입니다.'
				}
			};
			return new Response(JSON.stringify(result), { status: 403 });
		}
	}

	return resolve(event);
};

// export const handleError: HandleServerError = ({ error, event }) => {
//   console.error('⚠️ Error occurred:', error, 'at', event.url.pathname);

//   return {
//     message: '예상치 못한 오류가 발생했습니다.',
//   };
// };

export const handle = sequence(authenticationHandle, authorizationHandle, blockHandle);
