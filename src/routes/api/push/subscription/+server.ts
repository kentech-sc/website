import { json } from '@sveltejs/kit';

import type { DiningNotificationPreferences } from '$lib/types/push-subscription.type.js';

import * as Push from '$lib/server/push.js';

function hasSameOriginRequest(request: Request, origin: string): boolean {
	return request.headers.get('origin') === origin;
}

function isDiningNotificationPreferences(value: unknown): value is DiningNotificationPreferences {
	if (!value || typeof value !== 'object') return false;
	const preferences = value as Partial<DiningNotificationPreferences>;
	return (
		typeof preferences.breakfast === 'boolean' &&
		typeof preferences.lunch === 'boolean' &&
		typeof preferences.dinner === 'boolean'
	);
}

export const POST = async ({ request, locals, url }) => {
	if (locals.user.group === 'guest') {
		return json({ message: '로그인이 필요합니다.' }, { status: 401 });
	}

	if (!hasSameOriginRequest(request, url.origin)) {
		return json({ message: '허용되지 않은 요청 출처입니다.' }, { status: 403 });
	}

	const body: unknown = await request.json();
	if (!Push.isPushSubscriptionInput(body)) {
		return json({ message: '푸시 구독 정보가 올바르지 않습니다.' }, { status: 400 });
	}

	try {
		const subscription = await Push.saveUserPushSubscription(
			locals.user.id,
			body,
			request.headers.get('user-agent') ?? ''
		);

		return json({
			ok: true,
			endpoint: subscription.endpoint,
			diningPreferences: subscription.diningPreferences
		});
	} catch (error) {
		if (error instanceof Error) {
			return json({ message: error.message }, { status: 500 });
		}

		return json({ message: '푸시 구독 저장에 실패했습니다.' }, { status: 500 });
	}
};

export const PATCH = async ({ request, locals, url }) => {
	if (locals.user.group === 'guest') {
		return json({ message: '로그인이 필요합니다.' }, { status: 401 });
	}

	if (!hasSameOriginRequest(request, url.origin)) {
		return json({ message: '허용되지 않은 요청 출처입니다.' }, { status: 403 });
	}

	const body = (await request.json()) as { endpoint?: unknown; diningPreferences?: unknown };
	if (typeof body.endpoint !== 'string' || body.endpoint.length === 0) {
		return json({ message: 'endpoint 값이 필요합니다.' }, { status: 400 });
	}
	if (!isDiningNotificationPreferences(body.diningPreferences)) {
		return json({ message: '학식 알림 설정이 올바르지 않습니다.' }, { status: 400 });
	}

	const subscription = await Push.updateDiningNotificationPreferences(
		locals.user.id,
		body.endpoint,
		body.diningPreferences
	);
	if (!subscription) {
		return json({ message: '등록된 푸시 구독을 찾을 수 없습니다.' }, { status: 404 });
	}

	return json({ ok: true, diningPreferences: subscription.diningPreferences });
};

export const DELETE = async ({ request, locals, url }) => {
	if (locals.user.group === 'guest') {
		return json({ message: '로그인이 필요합니다.' }, { status: 401 });
	}

	if (!hasSameOriginRequest(request, url.origin)) {
		return json({ message: '허용되지 않은 요청 출처입니다.' }, { status: 403 });
	}

	const body = (await request.json()) as { endpoint?: unknown };
	if (typeof body.endpoint !== 'string' || body.endpoint.length === 0) {
		return json({ message: 'endpoint 값이 필요합니다.' }, { status: 400 });
	}

	const deletedCount = await Push.deleteUserPushSubscription(locals.user.id, body.endpoint);

	return json({
		ok: true,
		deletedCount
	});
};
