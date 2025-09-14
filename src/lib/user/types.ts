import type { UpdateQuery, Types } from 'mongoose';

export type Group = 'guest' | 'user' | 'dev' | 'moderator' | 'manager';
export type UserId = Types.ObjectId;
export type DisplayType = 'email' | 'realName' | 'nickname' | 'anonymous';

export interface UserBase {
	email: string;
	realName: string;
	nickname: string;
	group: Group;
	blockedUntil: Date | null;
}

export interface User extends UserBase {
	_id: UserId;
	createdAt: Date;
	updatedAt: Date;
}

export type UserCreate = UserBase;
export type UserUpdate = UpdateQuery<Pick<UserBase, 'nickname' | 'group'>>;
