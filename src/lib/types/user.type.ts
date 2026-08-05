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
	issuer: string;
	subject: string;
	email: string;
	name: string;
}

export interface UserCreate {
	email: string;
	realName: string;
	nickname: string;
	group: UserGroup;
	points: number;
}

export interface UserEntity extends UserCreate {
	id: UserId;
	createdAt: string;
	updatedAt: string;

	blockedUntil: string | null;
	deletedAt: string | null;
}

export type User = UserEntity;

export type UserAdminOption = Pick<
	UserEntity,
	'id' | 'email' | 'realName' | 'nickname' | 'group' | 'blockedUntil'
>;

export interface IdentityCreate {
	issuer: string;
	subject: string;
	emailAtLogin: string;
}

export type UserUpdate = Partial<
	Pick<UserEntity, 'email' | 'realName' | 'nickname' | 'group' | 'deletedAt' | 'blockedUntil'>
>;
