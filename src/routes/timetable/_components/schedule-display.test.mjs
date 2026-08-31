import assert from 'node:assert/strict';
import test from 'node:test';

import { formatRoomName } from './schedule-display.ts';

test('행정강의동 강의실은 화면에서 호실만 표시한다', () => {
	assert.equal(formatRoomName('행정강의동(B,C Zone)_C-304\u00a0 '), 'C-304');
	assert.equal(formatRoomName('행정강의동(A Zone)_A-205'), 'A-205');
});

test('다른 건물의 강의실 표기는 그대로 표시한다', () => {
	assert.equal(formatRoomName('RC교육생활관_124'), 'RC교육생활관_124');
	assert.equal(formatRoomName('체육시설_S-0003'), '체육시설_S-0003');
});
