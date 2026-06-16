import { json } from '@sveltejs/kit';

import * as Push from '$lib/server/push.js';

function hasSameOriginRequest(request: Request, origin: string): boolean {
	return request.headers.get('origin') === origin;
}

export const POST = async ({ request, locals, url }) => {
	if (locals.user.group === 'guest') {
		return json({ message: 'Login is required.' }, { status: 401 });
	}

	if (!hasSameOriginRequest(request, url.origin)) {
		return json({ message: 'Forbidden request origin.' }, { status: 403 });
	}

	const body: unknown = await request.json();
	if (!Push.isPushSubscriptionInput(body)) {
		return json({ message: 'Invalid push subscription.' }, { status: 400 });
	}

	try {
		const subscription = await Push.saveUserPushSubscription(
			locals.user._id,
			body,
			request.headers.get('user-agent') ?? ''
		);

		return json({
			ok: true,
			endpoint: subscription.endpoint
		});
	} catch (error) {
		if (error instanceof Error) {
			return json({ message: error.message }, { status: 500 });
		}

		return json({ message: 'Failed to save push subscription.' }, { status: 500 });
	}
};

export const DELETE = async ({ request, locals, url }) => {
	if (locals.user.group === 'guest') {
		return json({ message: 'Login is required.' }, { status: 401 });
	}

	if (!hasSameOriginRequest(request, url.origin)) {
		return json({ message: 'Forbidden request origin.' }, { status: 403 });
	}

	const body = (await request.json()) as { endpoint?: unknown };
	if (typeof body.endpoint !== 'string' || body.endpoint.length === 0) {
		return json({ message: 'Endpoint is required.' }, { status: 400 });
	}

	const deletedCount = await Push.deleteUserPushSubscription(locals.user._id, body.endpoint);

	return json({
		ok: true,
		deletedCount
	});
};
