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

	try {
		const subscriptions = await Push.findUserPushSubscriptions(locals.user._id);
		if (subscriptions.length === 0) {
			return json({ message: 'No push subscription found for this account.' }, { status: 400 });
		}

		const result = await Push.sendPushToUser(locals.user._id, {
			title: 'KENTECH',
			body: 'This is a test notification.',
			url: '/profile'
		});

		return json({
			ok: true,
			...result
		});
	} catch (error) {
		if (error instanceof Error) {
			return json({ message: error.message }, { status: 500 });
		}

		return json({ message: 'Failed to send test notification.' }, { status: 500 });
	}
};
