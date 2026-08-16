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
	const breakfast_menu = menu['josik_menu_contents'].split('\n').filter((item) => item !== '');
	const breakfast_dessert = menu['josik_husik_contents'].split('\n').filter((item) => item !== '');

	let breakfast =
		breakfast_menu.length === 0
			? '학식 정보가 없습니다.'
			: breakfast_menu.concat(breakfast_dessert).join(', ');

	if (breakfast_menu.includes('[주말 및 공휴일 조식]')) {
		breakfast = breakfast_menu[1];
	}

	// Dinner
	const dinner_menu = menu['seoksik_menu_contents'].split('\n').filter((item) => item !== '');
	const dinner_dessert = menu['seoksik_husik_contents'].split('\n').filter((item) => item !== '');
	const dinner =
		dinner_menu.length === 0
			? '학식 정보가 없습니다.'
			: dinner_menu.concat(dinner_dessert).join(', ');

	// Lunch
	const lunch_AB = menu['jungsik_menu_contents'].split('\n').filter((item) => item !== '');
	const lunch_dessert = menu['jungsik_husik_contents'].split('\n').filter((item) => item !== '');

	let lunch =
		lunch_AB.length === 0 ? '학식 정보가 없습니다.' : lunch_AB.concat(lunch_dessert).join(', ');

	if (lunch_AB.includes('A코너')) {
		const lunch_A = new Set(lunch_AB.splice(0, lunch_AB.indexOf('B코너')).slice(1));
		const lunch_B = new Set(lunch_AB.splice(lunch_AB.indexOf('B코너'), lunch_AB.length).slice(1));

		const onlyA = [...lunch_A].filter((item) => !lunch_B.has(item)); // a에만 있는 것
		const onlyB = [...lunch_B].filter((item) => !lunch_A.has(item)); // b에만 있는 것
		const overlap = [...lunch_A].filter((item) => lunch_B.has(item)); // 겹치는 것

		lunch = [
			'[A코너] ',
			onlyA.join(', '),
			'\n[B코너] ' + onlyB.join(', '),
			'\n[공통] ' + [...overlap, ...lunch_dessert].join(', ')
		].join('');
	}

	return {
		date,
		breakfast,
		lunch,
		dinner
	};
}
