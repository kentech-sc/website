import type { DiningMenus } from '$lib/types/dining.type.js';

import { parseDiningMenus, type DiningResponseBody } from '$lib/shared/dining-menu.js';

const DINING_URL = 'https://my.kentech.ac.kr/portlet/Ptl014.eps';

/** @param date YYYYMMDD */
export async function fetchDiningMenus(date: string): Promise<DiningMenus> {
	const response = await fetch(DINING_URL, {
		method: 'POST',
		headers: {
			'content-type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			lectureDate: date,
			direction: ''
		})
	});

	if (!response.ok) {
		throw new Error('학식 정보를 불러오지 못했습니다.');
	}

	const body = (await response.json()) as DiningResponseBody;
	return parseDiningMenus(body, date);
}
