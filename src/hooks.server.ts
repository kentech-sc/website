import * as Sentry from '@sentry/sveltekit';
import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { handle as authenticationHandle } from './auth.js';

import type { Profile } from '$lib/types/user.type.js';
import type { ActionResult, Cookies, Handle, HandleServerError, ServerInit } from '@sveltejs/kit';

import { env } from '$env/dynamic/private';
import * as DB from '$lib/server/db.js';
import { setServerFlash } from '$lib/server/flash.js';
import { FileStorage } from '$lib/server/storage.js';
import * as AuthUsecase from '$lib/usecase/auth.usecase.js';

function requiredEnvironmentVariable(name: string): string {
	const value = env[name]?.trim();
	if (!value) throw new Error(`${name} 환경 변수를 설정해 주세요.`);
	return value;
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
	await FileStorage.init({
		bucket: requiredEnvironmentVariable('STORAGE_BUCKET'),
		endpoint: requiredEnvironmentVariable('STORAGE_ENDPOINT'),
		publicBaseUrl: requiredEnvironmentVariable('STORAGE_PUBLIC_BASE_URL'),
		region: requiredEnvironmentVariable('STORAGE_REGION'),
		accessKeyId: requiredEnvironmentVariable('STORAGE_ACCESS_KEY_ID'),
		secretAccessKey: requiredEnvironmentVariable('STORAGE_SECRET_ACCESS_KEY'),
		sessionToken: env.STORAGE_SESSION_TOKEN?.trim() || undefined,
		maxFileSize: Number(requiredEnvironmentVariable('MAX_FILE_SIZE'))
	});
	await DB.init(requiredEnvironmentVariable('DATABASE_URL'));

	console.log('[Server Is Ready]');
};

const authorizationHandle: Handle = async ({ event, resolve }) => {
	const session = await event.locals.auth();

	if (session?.user?.id && session?.user?.email && session?.user?.name) {
		if (event.url.pathname.startsWith('/signin')) {
			throw redirect(303, '/');
		}

		const profile: Profile = {
			issuer: 'https://accounts.google.com',
			subject: session.user.id,
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
		id: '00000000-0000-0000-0000-000000000000',
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
	({ error, status, message, event }) => {
		console.error('SERVER_HANDLE_ERROR', {
			status,
			message,
			path: event.url.pathname,
			errorName: error instanceof Error ? error.name : typeof error,
			errorMessage: error instanceof Error ? error.message : String(error)
		});

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
