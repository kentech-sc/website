import type { DiningMenus } from '$lib/types/dining.type.js';

const DINING_URL = 'https://my.kentech.ac.kr/portlet/Ptl014.eps';

interface DiningResponseBody {
	diningList?: unknown;
}

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

function parseABCorner(dishesString: string, dessertsString: string): string {
	const dishes = dishesString.split('\n').filter((item) => item !== '');
	const desserts = dessertsString.split('\n').filter((item) => item !== '');

	if (dishes.length === 0) return '학식 정보가 없습니다.';

	if (dishes.includes('A코너')) {
		const cornerA = new Set(dishes.splice(0, dishes.indexOf('B코너')).slice(1));
		const cornerB = new Set(dishes.splice(dishes.indexOf('B코너'), dishes.length).slice(1));

		const onlyA = [...cornerA].filter((item) => !cornerB.has(item)); // a에만 있는 것
		const onlyB = [...cornerB].filter((item) => !cornerA.has(item)); // b에만 있는 것
		const overlap = [...cornerA].filter((item) => cornerB.has(item)); // 겹치는 것

		return [
			'[A코너] ',
			onlyA.join(', '),
			'\n[B코너] ' + onlyB.join(', '),
			'\n[공통] ' + [...overlap, ...desserts].join(', ')
		].join('');
	} else {
		return dishes.concat(desserts).join(', ');
	}
}

function parseDiningMenus(_body: DiningResponseBody, date: string): DiningMenus {
	const menu = (_body.diningList as Array<Record<string, string>>)[0] as {
		josik_menu_contents: string;
		josik_husik_contents: string;
		jungsik_menu_contents: string;
		jungsik_husik_contents: string;
		seoksik_menu_contents: string;
		seoksik_husik_contents: string;
	};

	// Breakfast
	let breakfast: string;
	if (menu['josik_menu_contents'].includes('[주말 및 공휴일 조식]'))
		breakfast = '간편식으로 대체운영합니다.';
	else breakfast = parseABCorner(menu['josik_menu_contents'], menu['josik_husik_contents']);

	// Lunch
	const lunch = parseABCorner(menu['jungsik_menu_contents'], menu['jungsik_husik_contents']);

	// Dinner
	const dinner = parseABCorner(menu['seoksik_menu_contents'], menu['seoksik_husik_contents']);

	return {
		date,
		breakfast,
		lunch,
		dinner
	};
}
