import { json } from '@sveltejs/kit';

import * as DiningUsecase from '$lib/usecase/dining.usecase.js';

/** 앞뒤로 이동할 수 있는 범위. 먼 날짜를 학교 포털에 반복 요청하지 않도록 제한한다. */
const DAY_RANGE = 7;

function isDateFormat(value: string): boolean {
	return /^\d{8}$/.test(value);
}

function toDate(dateString: string): Date {
	const year = Number(dateString.slice(0, 4));
	const month = Number(dateString.slice(4, 6));
	const day = Number(dateString.slice(6, 8));
	return new Date(Date.UTC(year, month - 1, day));
}

function isWithinRange(dateString: string): boolean {
	const today = toDate(DiningUsecase.getKstDateString());
	const target = toDate(dateString);
	const dayDiff = Math.round((target.getTime() - today.getTime()) / 86_400_000);
	return Math.abs(dayDiff) <= DAY_RANGE;
}

export const GET = async ({ url }) => {
	const date = url.searchParams.get('date') ?? DiningUsecase.getKstDateString();

	if (!isDateFormat(date)) {
		return json({ message: '날짜 형식이 올바르지 않습니다.' }, { status: 400 });
	}

	if (!isWithinRange(date)) {
		return json({ message: `앞뒤 ${DAY_RANGE}일까지만 볼 수 있습니다.` }, { status: 400 });
	}

	const menus = await DiningUsecase.getDiningMenusOrNull(date);

	if (!menus) {
		return json({ message: '학식 정보를 불러오지 못했습니다.' }, { status: 502 });
	}

	return json(menus);
};
