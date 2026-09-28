import assert from 'node:assert/strict';
import test from 'node:test';

import { formatRoomName, schedulePosition, scheduleHeight } from './schedule-display.ts';

test('행정강의동 강의실은 화면에서 호실만 표시한다', () => {
	assert.equal(formatRoomName('행정강의동(B,C Zone)_C-304\u00a0 '), 'C-304');
	assert.equal(formatRoomName('행정강의동(A Zone)_A-205'), 'A-205');
});

test('다른 건물의 강의실 표기는 그대로 표시한다', () => {
	assert.equal(formatRoomName('RC교육생활관_124'), 'RC교육생활관_124');
	assert.equal(formatRoomName('체육시설_S-0003'), '체육시설_S-0003');
});

test('강의와 빈칸은 시작 시간에 따라 서로 다른 행에 배치된다', () => {
	assert.equal(schedulePosition(9 * 60, 9 * 60), 0.65);
	assert.equal(schedulePosition(10 * 60, 9 * 60), 3.35);
	assert.equal(schedulePosition(14 * 60, 9 * 60), 14.15);
	assert.equal(scheduleHeight(9 * 60, 10 * 60 + 15), 3.375);
});
test('시간표 시작 시각이 바뀌어도 강의와 눈금의 간격이 유지된다', () => {
	assert.equal(schedulePosition(9 * 60, 8 * 60), 3.35);
	assert.equal(schedulePosition(8 * 60, 8 * 60), 0.65);
	assert.equal(scheduleHeight(12 * 60, 12 * 60 + 30), 1.35);
});
