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

export type UserId = string;

export interface Profile {
	id: string;
	email: string;
	name: string;
}

export interface UserCreate {
	_id: string;
	email: string;
	realName: string;
	nickname: string;
	group: UserGroup;
	points: number;
}

export interface UserEntity extends UserCreate {
	createdAt: string;
	updatedAt: string;

	blockedUntil: string | null;
	deletedAt: string | null;
}

export type User = UserEntity;

export type UserUpdate = Partial<
	Pick<UserEntity, 'email' | 'nickname' | 'group' | 'deletedAt' | 'points' | 'blockedUntil'>
>;
