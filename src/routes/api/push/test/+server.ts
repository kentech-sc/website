import { json } from '@sveltejs/kit';

import * as Push from '$lib/server/push.js';

function hasSameOriginRequest(request: Request, origin: string): boolean {
	return request.headers.get('origin') === origin;
}

export const POST = async ({ request, locals, url }) => {
	if (locals.user.group === 'guest') {
		return json({ message: '로그인이 필요합니다.' }, { status: 401 });
	}

	if (!hasSameOriginRequest(request, url.origin)) {
		return json({ message: '허용되지 않은 요청 출처입니다.' }, { status: 403 });
	}

	try {
		const input = (await request.json().catch(() => null)) as {
			title?: unknown;
			body?: unknown;
		} | null;
		const title = input === null ? 'KENTECH' : input.title;
		const body = input === null ? '테스트 알림입니다.' : input.body;

		if (typeof title !== 'string' || typeof body !== 'string') {
			return json({ message: '제목과 내용을 모두 입력해 주세요.' }, { status: 400 });
		}

		const normalizedTitle = title.trim();
		const normalizedBody = body.trim();
		if (!normalizedTitle || !normalizedBody) {
			return json({ message: '제목과 내용을 모두 입력해 주세요.' }, { status: 400 });
		}
		if (normalizedTitle.length > 80 || normalizedBody.length > 500) {
			return json({ message: '제목은 80자, 내용은 500자 이내로 입력해 주세요.' }, { status: 400 });
		}

		const subscriptions = await Push.findUserPushSubscriptions(locals.user.id);
		if (subscriptions.length === 0) {
			return json({ message: '이 계정에 등록된 푸시 구독이 없습니다.' }, { status: 400 });
		}

		const result = await Push.sendPushToUser(locals.user.id, {
			title: normalizedTitle,
			body: normalizedBody,
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

		return json({ message: '테스트 알림 전송에 실패했습니다.' }, { status: 500 });
	}
};
