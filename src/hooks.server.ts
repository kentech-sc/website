import * as Sentry from '@sentry/sveltekit';
import type { ActionResult, Cookies, Handle, HandleServerError, ServerInit } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { handle as authenticationHandle } from './auth.js';

import { AWS_BUCKET_NAME, AWS_ID, AWS_SECRET, MONGO_URI, AWS_BUCKET_REGION, MAX_FILE_SIZE } from '$env/static/private';

import { setServerFlash } from '$lib/server/flash.js';
import type { Profile } from '$lib/types/user.type.js';
import * as AuthUsecase from '$lib/usecase/auth.usecase.js';
import * as DB from '$lib/server/db.js';
import { FileStorage } from '$lib/server/storage.js';

function checkEnv() {
	if (MONGO_URI === undefined) {
		throw new Error('.env 파일에 "MONGO_URI"를 설정해 주세요.');
	}
	if (AWS_BUCKET_NAME === undefined) {
		throw new Error('.env 파일에 "AWS_BUCKET_NAME"을(를) 설정해 주세요.');
	}
	if (AWS_ID === undefined) {
		throw new Error('.env 파일에 "AWS_ID"를 설정해 주세요.');
	}
	if (AWS_SECRET === undefined) {
		throw new Error('.env 파일에 "AWS_SECRET"을(를) 설정해 주세요.');
	}
}

function clearAuthSessionCookies(cookies: Cookies): void {
	const sessionCookieNames = ['authjs.session-token', '__Secure-authjs.session-token'];
	const matchedCookieNames = new Set(
		cookies
			.getAll()
			.map(({ name }) => name)
			.filter((cookieName) =>
				sessionCookieNames.some(
					(sessionCookieName) =>
						cookieName === sessionCookieName || cookieName.startsWith(`${sessionCookieName}.`)
				)
			)
	);

	for (const sessionCookieName of sessionCookieNames) {
		matchedCookieNames.add(sessionCookieName);
	}

	for (const cookieName of matchedCookieNames) {
		cookies.delete(cookieName, { path: '/' });
	}
}

export const init: ServerInit = async () => {
	checkEnv();

	await FileStorage.init(AWS_BUCKET_NAME, AWS_BUCKET_REGION, AWS_ID, AWS_SECRET, Number(MAX_FILE_SIZE));
	await DB.init(MONGO_URI);

	console.log('[Server Is Ready]');
};

const authorizationHandle: Handle = async ({ event, resolve }) => {
	const session = await event.locals.auth();

	if (session?.user?.id && session?.user?.email && session?.user?.name) {
		if (event.url.pathname.startsWith('/signin')) {
			throw redirect(303, '/');
		}

		const profile: Profile = {
			id: session.user.id,
			email: session.user.email,
			name: session.user.name.split('/')[0]
		};

		const user = await AuthUsecase.getOrCreateUser(profile);

		if (user.deletedAt) {
			setServerFlash(event.cookies, {
				kind: 'error',
				message: '탈퇴한 계정은 로그인할 수 없습니다.'
			});
			clearAuthSessionCookies(event.cookies);
			throw redirect(303, '/');
		}

		event.locals.user = user;
		return await resolve(event);
	}

	if (
		event.url.pathname.startsWith('/petition') ||
		event.url.pathname.startsWith('/course') ||
		event.url.pathname.startsWith('/review') ||
		event.url.pathname.startsWith('/profile') ||
		/^\/board\/(?:free|notice|bylaw)\/(?:new|[^/]+\/edit)\/?$/.test(event.url.pathname)
	) {
		throw redirect(303, '/signin');
	}

	event.locals.user = {
		email: '',
		nickname: '',
		realName: '',
		blockedUntil: null,
		deletedAt: null,
		group: 'guest' as const,
		_id: 'temp-guest-id',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		points: 0
	};

	return await resolve(event);
};

export const blockHandle: Handle = async ({ event, resolve }) => {
	const user = event.locals.user;

	if (user?.blockedUntil && user.blockedUntil > new Date().toISOString()) {
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

	if (user?.deletedAt) {
		if (event.request.method === 'POST') {
			const result: ActionResult = {
				type: 'error',
				status: 403,
				error: {
					message: '탈퇴한 사용자입니다.'
				}
			};
			return new Response(JSON.stringify(result), { status: 403 });
		}
	}

	return resolve(event);
};

export const handleError: HandleServerError = Sentry.handleErrorWithSentry(
	({ error, status, message }) => {
		console.log(error);
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
