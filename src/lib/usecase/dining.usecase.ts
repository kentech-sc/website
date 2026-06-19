import type { DiningMenus, DiningSlot } from '$lib/types/dining.type.js';
import type { PushNotificationPayload } from '$lib/types/push-subscription.type.js';

import * as DiningService from '$lib/services/dining.service.js';

interface DiningPush {
	date: string;
	slot: DiningSlot;
	itemCount: number;
	payload: PushNotificationPayload;
}

export function isDiningSlot(value: string): value is DiningSlot {
	return value === 'breakfast' || value === 'lunch' || value === 'dinner';
}

export async function getDiningPush(
	slot: DiningSlot,
	now: Date = new Date()
): Promise<DiningPush | null> {
	const date = getKstDateString(now);
	const menus = await DiningService.fetchDiningMenus(date);
	const items = getDiningItems(menus, slot);

	if (items.length === 0) {
		return null;
	}

	return {
		date,
		slot,
		itemCount: items.length,
		payload: {
			title: getDiningTitle(slot),
			body: createDiningBody(items),
			url: '/'
		}
	};
}

function getKstDateString(now: Date): string {
	return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10).replace(/-/g, '');
}

function getDiningItems(menus: DiningMenus, slot: DiningSlot): string {
	if (slot === 'breakfast') return menus.breakfast;
	if (slot === 'lunch') return menus.lunch;
	return menus.dinner;
}

function getDiningTitle(slot: DiningSlot): string {
	if (slot === 'breakfast') return '오늘의 조식';
	if (slot === 'lunch') return '오늘의 중식';
	return '오늘의 석식';
}

function createDiningBody(items: string): string {
	// const preview = items.slice(0, 3);
	// const extraCount = items.length - preview.length;

	// if (extraCount > 0) {
	// 	return `${preview.join(', ')} 외 ${extraCount}개`;
	// }

	// return preview.join(', ');

	return items;
}
