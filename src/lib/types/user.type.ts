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

export interface UserBase {
	email: string;
	realName: string;
	nickname: string;
	group: UserGroup;
	blockedUntil: Date | null;
}

export interface User extends UserBase {
	_id: UserId;
	createdAt: Date;
	updatedAt: Date;
}

export type UserCreate = UserBase;
export type UserUpdate = UpdateQuery<Pick<UserBase, 'nickname' | 'group'>>;
