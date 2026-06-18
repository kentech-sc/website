import { json } from '@sveltejs/kit';

import { env as privateEnv } from '$env/dynamic/private';
import * as Push from '$lib/server/push.js';
import * as DiningUsecase from '$lib/usecase/dining.usecase.js';

function isAuthorizedCronRequest(request: Request): boolean {
	return request.headers.get('authorization') === `Bearer ${privateEnv.CRON_SECRET}`;
}

export const GET = async ({ params, request }) => {
	if (!privateEnv.CRON_SECRET || !isAuthorizedCronRequest(request)) {
		return json({ message: '허용되지 않은 요청입니다.' }, { status: 401 });
	}

	if (!DiningUsecase.isDiningSlot(params.slot)) {
		return json({ message: '잘못된 식사 구분입니다.' }, { status: 400 });
	}

	try {
		const diningPush = await DiningUsecase.getDiningPush(params.slot);

		if (!diningPush) {
			return json({
				ok: true,
				slot: params.slot,
				skipped: true,
				reason: 'empty'
			});
		}

		const result = await Push.sendPushToAllSubscribers(diningPush.payload);

		return json({
			ok: true,
			date: diningPush.date,
			slot: diningPush.slot,
			itemCount: diningPush.itemCount,
			...result
		});
	} catch (error) {
		if (error instanceof Error) {
			return json({ message: error.message }, { status: 500 });
		}

		return json({ message: '학식 알림 발송에 실패했습니다.' }, { status: 500 });
	}
};
