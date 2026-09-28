import type { UserGender, UserHouse } from '../types/user.type.js';

export function isUserGender(value: unknown): value is UserGender {
	return value === 'male' || value === 'female';
}

export function isUserHouse(value: unknown): value is UserHouse {
	return value === 'tesla' || value === 'edison';
}

const LAUNDRY_URLS = {
	edison: {
		male: 'http://state.coin-machine.com/1590',
		female: 'http://state.coin-machine.com/1591'
	},
	tesla: {
		male: 'http://state.coin-machine.com/1592',
		female: 'http://state.coin-machine.com/1593'
	}
} as const;

export function getLaundryUrl(user: { gender: unknown; house: unknown }): string | null {
	return isUserGender(user.gender) && isUserHouse(user.house)
		? LAUNDRY_URLS[user.house][user.gender]
		: null;
}
