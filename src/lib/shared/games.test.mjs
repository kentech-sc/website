import assert from 'node:assert/strict';
import test from 'node:test';

import {
	calculateReactionScore,
	getColorBoard,
	getGameWeek,
	getNextGameWeekStart,
	getReactionDelay,
	isSuspiciousReaction
} from './games.ts';
import {
	gradeRecyclingChoice,
	isRecyclingChoice,
	RECYCLING_BINS,
	RECYCLING_ITEMS
} from './recycling.ts';

const SEED = 190121;

test('종이팩과 무색 페트병은 기타가 정답이고 각각의 대체 분류는 감점하지 않는다', () => {
	for (const [expected, fallback] of [
		['carton', 'paper'],
		['clearPet', 'plastic']
	]) {
		assert.ok(RECYCLING_BINS.every(({ id }) => id !== expected));
		const item = [expected, expected];
		for (const { id } of RECYCLING_BINS) {
			const scoreDelta = id === 'other' ? 1 : id === fallback ? 0 : -1;
			assert.deepEqual(gradeRecyclingChoice(item, id), { correctBin: 'other', scoreDelta });
		}
		assert.ok(isRecyclingChoice(expected));
		assert.deepEqual(gradeRecyclingChoice(item, expected), {
			correctBin: expected,
			scoreDelta: 1
		});
	}
	assert.deepEqual(gradeRecyclingChoice(['건전지', 'other'], 'paper'), {
		correctBin: 'other',
		scoreDelta: -1
	});
	assert.deepEqual(gradeRecyclingChoice(['PET 트레이', 'plastic'], 'other'), {
		correctBin: 'plastic',
		scoreDelta: -1
	});
});

test('대체 분류는 지정한 품목에서만 0점이고 일반 오답은 감점한다', () => {
	const riceContainer = RECYCLING_ITEMS.find(([name]) => name === '즉석밥 용기');
	assert.ok(riceContainer);
	const storedItem = JSON.parse(JSON.stringify(riceContainer));
	for (const { id } of RECYCLING_BINS) {
		const scoreDelta = id === 'plastic' ? 1 : id === 'trash' ? 0 : -1;
		assert.deepEqual(gradeRecyclingChoice(storedItem, id), { correctBin: 'plastic', scoreDelta });
	}
	const scissors = RECYCLING_ITEMS.find(([name]) => name === '전체가 금속인 가위');
	assert.ok(scissors);
	assert.deepEqual(gradeRecyclingChoice(scissors, 'other'), { correctBin: 'can', scoreDelta: -1 });
	assert.deepEqual(gradeRecyclingChoice(['스티로폼 상자', 'styrofoam'], 'other'), {
		correctBin: 'other',
		scoreDelta: 1
	});
});

test('수강신청 버튼 대기 시간은 판과 라운드에 따라 달라진다', () => {
	const delays = Array.from({ length: 5 }, (_, round) => getReactionDelay(SEED, round));
	assert.ok(delays.every((delay) => delay >= 1500 && delay < 4000));
	assert.ok(new Set(delays).size > 1);
	assert.notEqual(getReactionDelay(SEED + 1, 0), delays[0]);
});

test('주간 기록은 한국 시간 월요일 자정에 전환한다', () => {
	assert.equal(getGameWeek(new Date('2026-11-01T14:59:59Z')), '2026-10-26');
	assert.equal(getGameWeek(new Date('2026-11-01T15:00:00Z')), '2026-11-02');
	assert.equal(getGameWeek(new Date('2026-11-03T01:00:00Z')), '2026-11-02');
	assert.equal(getGameWeek(new Date('2027-01-01T00:00:00Z')), '2026-12-28');
});

test('다음 초기화 시각은 한국 시간 월요일 00:00이다', () => {
	assert.equal(getNextGameWeekStart(new Date('2026-11-01T14:59:59Z')), '2026-11-01T15:00:00.000Z');
	assert.equal(getNextGameWeekStart(new Date('2026-11-01T15:00:00Z')), '2026-11-08T15:00:00.000Z');
	assert.equal(getNextGameWeekStart(new Date('2026-11-03T01:00:00Z')), '2026-11-08T15:00:00.000Z');
	assert.equal(getNextGameWeekStart(new Date('2027-01-01T00:00:00Z')), '2027-01-03T15:00:00.000Z');
});

test('순발력은 80ms 미만도 집계하고 5회가 아니거나 범위를 벗어난 측정은 거부한다', () => {
	assert.equal(calculateReactionScore([180, 220, 250, 280, 300]), 246);
	assert.equal(calculateReactionScore([0, 42, 79, 80, 99]), 60);
	assert.equal(calculateReactionScore([0, 0, 0, 0, 0]), 0);
	assert.equal(calculateReactionScore([180, 220]), null);
	assert.equal(calculateReactionScore([-1, 220, 250, 280, 300]), null);
	assert.equal(calculateReactionScore([180, 220, 250, 280, 2001]), null);
});

test('타일 위치는 범위 안에서 달라지고 서버와 클라이언트에 같은 보드가 만들어진다', () => {
	const targets = new Set();
	for (let round = 0; round < 100; round++) {
		const board = getColorBoard(SEED, round);
		assert.deepEqual(board, getColorBoard(SEED, round));
		assert.ok(board.target >= 0 && board.target < board.side ** 2);
		assert.ok(board.side >= 2 && board.side <= 6);
		assert.notEqual(board.base, board.accent);
		targets.add(board.target);
	}
	assert.ok(targets.size > 10);
});

test('순발력에서 한 번의 빠른 입력은 허용하고 반복되는 초고속 입력을 감지한다', () => {
	assert.equal(isSuspiciousReaction([16, 220, 250, 280, 300]), false);
	assert.equal(isSuspiciousReaction([60, 65, 72, 75, 79]), false);
	assert.equal(isSuspiciousReaction([16, 7, 3, 4, 200]), true);
});
