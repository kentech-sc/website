export type DiningSlot = 'breakfast' | 'lunch' | 'dinner';

export interface DiningMenus {
	date: string;
	breakfast: string[];
	lunch: string[];
	dinner: string[];
}
