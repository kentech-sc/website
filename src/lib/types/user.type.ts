import type { UpdateQuery, Types } from 'mongoose';

export const UserGroup = {
	Guest: 'guest',
	User: 'user',
	Dev: 'dev',
	Moderator: 'moderator',
	Manager: 'manager'
} as const;

export type UserGroup = (typeof UserGroup)[keyof typeof UserGroup];

export const DisplayType = {
	Email: 'email',
	RealName: 'realName',
	Nickname: 'nickname',
	Anonymous: 'anonymous'
} as const;

export type DisplayType = (typeof DisplayType)[keyof typeof DisplayType];

export type UserId = Types.ObjectId;

export interface UserCreate {
	email: string;
	realName: string;
	nickname: string;
	group: UserGroup;
}

export interface UserDoc extends UserCreate {
	_id: UserId;
	createdAt: Date;
	updatedAt: Date;

	blockedUntil: Date | null;
}

export type User = UserDoc;

export type UserUpdate = UpdateQuery<Pick<UserDoc, 'nickname' | 'group'>>;
