import type { Capability } from '$lib/types/general.type.js';

import { BoardId, type BoardId as BoardIdType } from '$lib/types/board.type.js';

export interface BoardDefinition {
	title: string;
	description: string;
	writeCapability: Capability;
}

export const BOARD_DEFINITIONS: Record<BoardIdType, BoardDefinition> = {
	[BoardId.Notice]: {
		title: '공지사항',
		description: '학생회의 공지사항을 한눈에 확인하세요',
		writeCapability: 'board.notice.write'
	},
	[BoardId.Free]: {
		title: '자유게시판',
		description: '구성원들과 자유로운 대화를 나눠보세요',
		writeCapability: 'board.free.write'
	},
	[BoardId.Bylaw]: {
		title: '회칙·세칙',
		description: '총학생회의 회칙과 세칙을 확인하세요',
		writeCapability: 'board.bylaw.write'
	}
};

export function isBoardId(value: string | undefined): value is BoardIdType {
	return value !== undefined && Object.hasOwn(BOARD_DEFINITIONS, value);
}
