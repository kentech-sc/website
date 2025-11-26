import * as Sentry from '@sentry/sveltekit';
import type { ActionResult, Handle, HandleServerError, ServerInit } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

// import { AWS_BUCKET_NAME, AWS_ID, AWS_SECRET } from '$env/static/private';
import { MONGO_URI } from '$env/static/private';

import { handle as authenticationHandle } from './auth.js';
import * as DBService from '$lib/common/db.js';
import * as UserService from '$lib/srv/user.srv.js';
import type { User } from '$lib/types/user.type.js';
import { Types } from 'mongoose';

function checkEnv() {
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

		if (
			event.url.pathname.startsWith('/petition') ||
			event.url.pathname.startsWith('/course') ||
			event.url.pathname.startsWith('/review') ||
			event.url.pathname.startsWith('/profile') ||
			/^\/board\/(?:free|notice)\/(?:new|edit)/.test(event.url.pathname)
		) {
			redirect(303, '/signin');
		}

		const user = {
			email: '',
			nickname: '',
			realName: '',
			blockedUntil: null,
			group: 'guest' as const,
			_id: new Types.ObjectId(),
			createdAt: new Date(),
			updatedAt: new Date()
		};
		event.locals.user = user;

		return await resolve(event);
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

export const handleError: HandleServerError = Sentry.handleErrorWithSentry(
	({ status, message }) => {
		return {
			message,
			status
		};
	}
);

export const handle = sequence(
	Sentry.sentryHandle(),
	sequence(authenticationHandle, authorizationHandle, blockHandle)
);
