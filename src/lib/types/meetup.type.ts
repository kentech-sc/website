import type { UserId } from './user.type.js';

export const MeetupMode = {
	/** 실제 날짜를 고른다. 한 번 모이는 회의용. */
	Dates: 'dates',
	/** 요일만 고른다. 학기 내내 반복되는 모임용. */
	Weekdays: 'weekdays'
} as const;

export type MeetupMode = (typeof MeetupMode)[keyof typeof MeetupMode];

export type MeetupId = string;

export interface Meetup {
	id: MeetupId;
	creatorId: UserId;
	title: string;
	mode: MeetupMode;
	/** 날짜 모드는 'YYYY-MM-DD', 요일 모드는 '1'(월)~'7'(일). 정렬돼 있다. */
	days: string[];
	startMinute: number;
	endMinute: number;
	createdAt: string;
	updatedAt: string;
}

export interface MeetupCreate {
	creatorId: UserId;
	title: string;
	mode: MeetupMode;
	days: string[];
	startMinute: number;
	endMinute: number;
}

export interface MeetupResponse {
	userId: UserId;
	nickname: string;
	slots: number[];
	updatedAt: string;
}

export interface MeetupSummary {
	id: MeetupId;
	creatorId: UserId;
	title: string;
	mode: MeetupMode;
	days: string[];
	responseCount: number;
	createdAt: string;
}
