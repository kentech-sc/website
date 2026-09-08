import assert from 'node:assert/strict';
import test from 'node:test';

import { formatMeal, isEmptyMeal, parseDiningMenus } from './dining-menu.ts';

function body(row) {
	return { diningList: [row] };
}

test('한 끼의 메뉴와 후식을 나눠 담는다', () => {
	const menus = parseDiningMenus(
		body({
			jungsik_menu_contents: '잡곡밥\n들깨무채국\n동태강정\n',
			jungsik_husik_contents: '셀프후라이/보리차'
		}),
		'20260826'
	);

	assert.equal(menus.date, '20260826');
	assert.deepEqual(menus.lunch.sections, [
		{ label: null, items: ['잡곡밥', '들깨무채국', '동태강정'] }
	]);
	assert.deepEqual(menus.lunch.dessert, ['셀프후라이/보리차']);
	assert.equal(menus.lunch.note, null);
});

test('식단이 등록되지 않은 날은 빈 끼니로 돌려준다', () => {
	const menus = parseDiningMenus({ diningList: [] }, '20271231');

	assert.ok(isEmptyMeal(menus.breakfast));
	assert.ok(isEmptyMeal(menus.lunch));
	assert.ok(isEmptyMeal(menus.dinner));
});

test('응답에 diningList 가 아예 없어도 터지지 않는다', () => {
	const menus = parseDiningMenus({}, '20271231');

	assert.ok(isEmptyMeal(menus.lunch));
});

test('주말 조식처럼 안내 문구만 오는 경우 문구로 담는다', () => {
	const menus = parseDiningMenus(
		body({
			josik_menu_contents: '[주말 및 공휴일 조식]\n간편식으로 대체운영합니다.',
			josik_husik_contents: ''
		}),
		'20260830'
	);

	assert.equal(menus.breakfast.note, '간편식으로 대체운영합니다.');
	assert.deepEqual(menus.breakfast.sections, []);
	assert.equal(isEmptyMeal(menus.breakfast), false);
});

test('중식 A/B 코너를 나누고 양쪽에 겹치는 메뉴는 공통으로 묶는다', () => {
	const menus = parseDiningMenus(
		body({
			jungsik_menu_contents: 'A코너\n돈까스\n배추김치\nB코너\n비빔밥\n배추김치',
			jungsik_husik_contents: '요거트'
		}),
		'20260901'
	);

	assert.deepEqual(menus.lunch.sections, [
		{ label: 'A코너', items: ['돈까스'] },
		{ label: 'B코너', items: ['비빔밥'] },
		{ label: '공통', items: ['배추김치'] }
	]);
});

test('코너 표시가 없으면 구분 없이 한 덩어리로 둔다', () => {
	const menus = parseDiningMenus(body({ seoksik_menu_contents: '잡곡밥\n버섯된장국' }), '20260826');

	assert.equal(menus.dinner.sections.length, 1);
	assert.equal(menus.dinner.sections[0].label, null);
});

test('푸시 알림용 한 줄 문자열로 조립한다', () => {
	const menus = parseDiningMenus(
		body({
			jungsik_menu_contents: 'A코너\n돈까스\n배추김치\nB코너\n비빔밥\n배추김치',
			jungsik_husik_contents: '요거트'
		}),
		'20260901'
	);

	assert.equal(
		formatMeal(menus.lunch),
		'[A코너] 돈까스 / [B코너] 비빔밥 / [공통] 배추김치 / 요거트'
	);
});

test('안내 문구만 있는 끼니는 문구를 그대로 쓴다', () => {
	const menus = parseDiningMenus(
		body({ josik_menu_contents: '[주말 및 공휴일 조식]\n간편식으로 대체운영합니다.' }),
		'20260830'
	);

	assert.equal(formatMeal(menus.breakfast), '간편식으로 대체운영합니다.');
});
