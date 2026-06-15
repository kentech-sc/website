import type { PetitionStatus } from '$lib/types/petition.type.js';

export const translatedStatus: Record<PetitionStatus, string> = {
	ongoing: '진행 중',
	pending: '검토 대기',
	reviewing: '검토 중',
	answered: '응답 완료',
	expired: '기간 만료'
};

export const colorStatus: Record<PetitionStatus, string> = {
	ongoing: 'blue',
	pending: 'orange',
	reviewing: 'red',
	answered: 'green',
	expired: 'gray'
};

export const translatedTerm: Record<number, string> = {
	1: '1',
	2: '2',
	3: '여름',
	4: '겨울'
};
