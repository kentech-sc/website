export type DiningSlot = 'breakfast' | 'lunch' | 'dinner';

/** 중식 A/B 코너처럼 한 끼가 여러 구획으로 나뉘는 날이 있다. 구분이 없으면 label 은 null. */
export interface DiningSection {
	label: string | null;
	items: string[];
}

export interface DiningMeal {
	sections: DiningSection[];
	dessert: string[];
	/** 주말 조식처럼 메뉴 대신 안내 문구만 오는 경우. */
	note: string | null;
}

export interface DiningMenus {
	/** YYYYMMDD */
	date: string;
	breakfast: DiningMeal;
	lunch: DiningMeal;
	dinner: DiningMeal;
}
