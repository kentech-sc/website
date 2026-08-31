import type { DiningMeal, DiningMenus, DiningSlot } from '$lib/types/dining.type.js';
import type { PushNotificationPayload } from '$lib/types/push-subscription.type.js';

import * as DiningService from '$lib/services/dining.service.js';
import { formatMeal, getMeal, isEmptyMeal } from '$lib/shared/dining-menu.js';

interface DiningPush {
	date: string;
	slot: DiningSlot;
	itemCount: number;
	payload: PushNotificationPayload;
}

export function isDiningSlot(value: string): value is DiningSlot {
	return value === 'breakfast' || value === 'lunch' || value === 'dinner';
}

/** @param date YYYYMMDD. 없으면 오늘(KST). */
export async function getDiningMenus(date?: string): Promise<DiningMenus> {
	return await DiningService.fetchDiningMenus(date ?? getKstDateString());
}

/**
 * 홈 화면은 학식이 없어도 떠야 하므로 실패를 삼킨다.
 * 학교 포털이 느리거나 응답하지 않을 때 메인 전체가 함께 멈추지 않도록 한다.
 */
export async function getDiningMenusOrNull(date?: string): Promise<DiningMenus | null> {
	try {
		return await getDiningMenus(date);
	} catch {
		return null;
	}
}

export async function getDiningPush(
	slot: DiningSlot,
	now: Date = new Date()
): Promise<DiningPush | null> {
	const date = getKstDateString(now);
	const menus = await DiningService.fetchDiningMenus(date);
	const meal = getMeal(menus, slot);

	if (isEmptyMeal(meal)) {
		return null;
	}

	return {
		date,
		slot,
		itemCount: countItems(meal),
		payload: {
			title: getDiningTitle(slot),
			body: formatMeal(meal),
			url: '/'
		}
	};
}

export function getKstDateString(now: Date = new Date()): string {
	return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10).replace(/-/g, '');
}

function countItems(meal: DiningMeal): number {
	const menuCount = meal.sections.reduce((total, section) => total + section.items.length, 0);
	return menuCount + meal.dessert.length;
}

function getDiningTitle(slot: DiningSlot): string {
	if (slot === 'breakfast') return '오늘의 조식';
	if (slot === 'lunch') return '오늘의 중식';
	return '오늘의 석식';
}
