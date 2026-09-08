import type { DiningMeal, DiningMenus, DiningSlot } from '$lib/types/dining.type.js';

/** 포털 응답 한 건. 비어 오는 필드가 있어 모두 선택적으로 다룬다. */
export interface DiningRow {
	josik_menu_contents?: string;
	josik_husik_contents?: string;
	jungsik_menu_contents?: string;
	jungsik_husik_contents?: string;
	seoksik_menu_contents?: string;
	seoksik_husik_contents?: string;
}

export interface DiningResponseBody {
	diningList?: unknown;
}

const EMPTY_MEAL: DiningMeal = { sections: [], dessert: [], note: null };

function toLines(value: string | undefined): string[] {
	if (!value) return [];
	return value
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line !== '');
}

/**
 * 중식은 A/B 코너로 나뉘는 날이 있다. 코너 표시가 없으면 구분 없는 한 덩어리로 둔다.
 *
 * 코너를 나누는 계산은 dining.service 에 있던 parseABCorner 구현을 그대로 옮겼다.
 * 반환만 문자열 대신 구획 목록으로 바꿔 화면에서 코너별로 그릴 수 있게 했다.
 */
function toSections(lines: string[]): DiningMeal['sections'] {
	if (!lines.includes('A코너')) {
		return lines.length ? [{ label: null, items: lines }] : [];
	}

	const dishes = [...lines];
	const cornerA = new Set(dishes.splice(0, dishes.indexOf('B코너')).slice(1));
	const cornerB = new Set(dishes.splice(dishes.indexOf('B코너'), dishes.length).slice(1));

	const onlyA = [...cornerA].filter((item) => !cornerB.has(item)); // a에만 있는 것
	const onlyB = [...cornerB].filter((item) => !cornerA.has(item)); // b에만 있는 것
	const overlap = [...cornerA].filter((item) => cornerB.has(item)); // 겹치는 것

	const sections: DiningMeal['sections'] = [];
	if (onlyA.length) sections.push({ label: 'A코너', items: onlyA });
	if (onlyB.length) sections.push({ label: 'B코너', items: onlyB });
	if (overlap.length) sections.push({ label: '공통', items: overlap });
	return sections;
}

/**
 * 주말·공휴일 조식처럼 메뉴 대신 안내 문구만 오는 날이 있다.
 * 대괄호로 묶인 첫 줄이 그 표시다.
 */
function toMeal(menuField: string | undefined, dessertField: string | undefined): DiningMeal {
	const lines = toLines(menuField);
	if (lines.length === 0) return EMPTY_MEAL;

	if (lines[0].startsWith('[') && lines[0].endsWith(']')) {
		return { sections: [], dessert: [], note: lines.slice(1).join(' ') || lines[0] };
	}

	return { sections: toSections(lines), dessert: toLines(dessertField), note: null };
}

export function parseDiningMenus(body: DiningResponseBody, date: string): DiningMenus {
	const rows = Array.isArray(body.diningList) ? (body.diningList as DiningRow[]) : [];
	const row = rows[0];

	// 등록된 식단이 아예 없는 날은 빈 목록으로 온다.
	if (!row) {
		return { date, breakfast: EMPTY_MEAL, lunch: EMPTY_MEAL, dinner: EMPTY_MEAL };
	}

	return {
		date,
		breakfast: toMeal(row.josik_menu_contents, row.josik_husik_contents),
		lunch: toMeal(row.jungsik_menu_contents, row.jungsik_husik_contents),
		dinner: toMeal(row.seoksik_menu_contents, row.seoksik_husik_contents)
	};
}

export function isEmptyMeal(meal: DiningMeal): boolean {
	return meal.sections.length === 0 && meal.dessert.length === 0 && !meal.note;
}

export function getMeal(menus: DiningMenus, slot: DiningSlot): DiningMeal {
	if (slot === 'breakfast') return menus.breakfast;
	if (slot === 'lunch') return menus.lunch;
	return menus.dinner;
}

/** 푸시 알림처럼 한 줄 문자열이 필요한 곳에서 쓴다. */
export function formatMeal(meal: DiningMeal): string {
	if (meal.note) return meal.note;

	const parts = meal.sections.map((section) =>
		section.label ? `[${section.label}] ${section.items.join(', ')}` : section.items.join(', ')
	);
	if (meal.dessert.length) parts.push(meal.dessert.join(', '));
	return parts.join(' / ');
}
