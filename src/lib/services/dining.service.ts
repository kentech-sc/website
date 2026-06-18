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

	console.log(menu);

	const breakfast = menu['josik_menu_contents'].split('\n').concat(menu['josik_husik_contents'].split('\n'));
	const lunch_AB = menu['jungsik_menu_contents'].split('\n');
	const lunch_dessert = menu['jungsik_husik_contents'].split('\n');
	const dinner = menu['seoksik_menu_contents'].split('\n').concat(menu['seoksik_husik_contents'].split('\n'));

	const lunch_A = new Set(lunch_AB.splice(0, lunch_AB.indexOf('')).slice(1));
	const lunch_B = new Set(lunch_AB.splice(lunch_AB.indexOf('')+1).slice(1));

	const onlyA = [...lunch_A].filter((item) => !lunch_B.has(item));       // a에만 있는 것
	const onlyB = [...lunch_B].filter((item) => !lunch_A.has(item));       // b에만 있는 것
	const overlap = [...lunch_A].filter((item) => lunch_B.has(item));      // 겹치는 것

	const lunch = ['[A코너]', ...onlyA, '[B코너]', ...onlyB, '[공통]', ...overlap, ...lunch_dessert];

	return {
		date,
		breakfast,
		lunch,
		dinner,
	};
}
