import type { Types } from 'mongoose';

export type Group = 'none' | 'any' | 'guest' | 'user' | 'dev' | 'manager' | 'blocked' | UserId;
export type UserId = Types.ObjectId;

export interface UserBase {
	email: string;
	name: string;
	group: Group;
}

export interface User extends UserBase {
	_id: UserId;
	createdAt: Date;
	updatedAt: Date;
}

export type UserCreate = UserBase;
export type UserUpdate = Partial<Pick<UserBase, 'name' | 'group'>>;
