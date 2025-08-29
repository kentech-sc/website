import type { UpdateQuery, Types } from 'mongoose';

export type Group = 'none' | 'any' | 'guest' | 'user' | 'dev' | 'manager' | 'blocked' | UserId;
export type UserId = Types.ObjectId;
export type DisplayType = 'email' | 'realName' | 'nickname' | 'anonymous';

export interface UserBase {
	email: string;
	realName: string;
	nickname: string;
	group: Group;
}

export interface User extends UserBase {
	_id: UserId;
	createdAt: Date;
	updatedAt: Date;
}

export type UserCreate = UserBase;
export type UserUpdate = UpdateQuery<Pick<UserBase, 'nickname' | 'group'>>;
