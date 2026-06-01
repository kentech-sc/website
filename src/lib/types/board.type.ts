import { UserGroup } from '$lib/types/user.type.js';

export const BoardId = {
	Notice: 'notice',
	Free: 'free',
	Bylaw: 'bylaw'
} as const;

export type BoardId = (typeof BoardId)[keyof typeof BoardId];

interface BoardConfig {
	label: string;
	description: string;
	allowComments: boolean;
	allowLikes: boolean;
	autoPdfPreview: boolean;
	writeMinRole: UserGroup;
}

export const BOARD_CONFIG: Record<BoardId, BoardConfig> = {
	[BoardId.Notice]: {
		label: '공지사항',
		description: '학생회의 공지사항을 한눈에 확인하세요',
		allowComments: false,
		allowLikes: true,
		autoPdfPreview: false,
		writeMinRole: UserGroup.Moderator
	},
	[BoardId.Free]: {
		label: '자유게시판',
		description: '구성원들과 자유로운 대화를 나눠보세요',
		allowComments: true,
		allowLikes: true,
		autoPdfPreview: false,
		writeMinRole: UserGroup.User
	},
	[BoardId.Bylaw]: {
		label: '회칙·세칙',
		description: '총학생회의 회칙과 세칙을 확인하세요',
		allowComments: false,
		allowLikes: true,
		autoPdfPreview: true,
		writeMinRole: UserGroup.Moderator
	}
};
