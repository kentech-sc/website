import type { DisplayType, User } from '$lib/types/user.type.js';

export function toPojo<T>(data: unknown): T {
	if (data === undefined || data === null) return data as T;
	return JSON.parse(JSON.stringify(data)) as T;
}

export function ignoreHtml(content: string): string {
	return content.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function normalizeHtml(content: string): string {
	return content.replaceAll('&lt;', '<').replaceAll('&gt;', '>');
}

export function getPlainTextFromHtml(html: string): string {
	return html
		.replace(/<[^>]*>/g, ' ')
		.replaceAll('&nbsp;', ' ')
		.replaceAll('&amp;', '&')
		.replaceAll('&lt;', '<')
		.replaceAll('&gt;', '>')
		.replaceAll('&quot;', '"')
		.replaceAll('&#39;', "'")
		.replace(/\s+/g, ' ')
		.trim();
}

export function appendValueByKey<K, V>(keyToValues: Map<K, V[]>, key: K, value: V): void {
	const values = keyToValues.get(key);
	if (values) {
		values.push(value);
	} else {
		keyToValues.set(key, [value]);
	}
}

export function moveItemToFront<T>(items: T[], item: T): void {
	if (!items.includes(item)) return;
	items.splice(items.indexOf(item), 1);
	items.splice(0, 0, item);
}

export function moveItemToBack<T>(items: T[], item: T): void {
	if (!items.includes(item)) return;
	items.splice(items.indexOf(item), 1);
	items.push(item);
}

export function getAddedItems<T>(previousItems: T[], nextItems: T[]): T[] {
	const previousItemSet = new Set(previousItems);
	return nextItems.filter((item) => !previousItemSet.has(item));
}

export function haveSameItems<T>(items1: T[], items2: T[]): boolean {
	if (items1.length !== items2.length) return false;

	const sortedItems1 = [...items1].sort();
	const sortedItems2 = [...items2].sort();
	return sortedItems1.every((value, index) => value === sortedItems2[index]);
}

export function calcByte(text: string): number {
	let bytes = 0;

	for (const char of text) {
		const code = char.charCodeAt(0);
		if (code <= 0x7f) bytes += 1;
		else if (code <= 0x7ff) bytes += 2;
		else bytes += 3;
	}

	return bytes;
}

export function parseDate(
	date: Date | string,
	type: 'date' | 'datetime' | 'time' | 'datetime-iso' | 'date-iso' = 'datetime'
): string {
	const value = typeof date === 'string' ? new Date(date) : date;
	const pad = (n: number) => n.toString().padStart(2, '0');

	if (type === 'datetime') {
		return `${value.getFullYear()}/${pad(value.getMonth() + 1)}/${pad(value.getDate())} ${pad(
			value.getHours()
		)}:${pad(value.getMinutes())}`;
	}

	if (type === 'datetime-iso') return value.toISOString();
	if (type === 'date') {
		return `${value.getFullYear()}/${pad(value.getMonth() + 1)}/${pad(value.getDate())}`;
	}
	if (type === 'date-iso') return value.toISOString().split('T')[0];
	if (type === 'time') return `${pad(value.getHours())}:${pad(value.getMinutes())}`;

	return '';
}

export function parseRelativeDate(date: Date | string): string {
	const value = typeof date === 'string' ? new Date(date) : date;
	const now = new Date();
	const diffMs = now.getTime() - value.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) {
		const pad = (n: number) => n.toString().padStart(2, '0');
		return `${pad(value.getHours())}:${pad(value.getMinutes())}`;
	}

	if (diffDays < 31) return `${diffDays}일 전`;

	const diffMonths = Math.floor(diffDays / 30);
	if (diffMonths < 12) return `${diffMonths}개월 전`;

	return `${Math.floor(diffMonths / 12)}년 전`;
}

export const CHOSEONGS: string[] = [
	'0',
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9',
	'A',
	'B',
	'C',
	'D',
	'E',
	'F',
	'G',
	'H',
	'I',
	'J',
	'K',
	'L',
	'M',
	'N',
	'O',
	'P',
	'Q',
	'R',
	'S',
	'T',
	'U',
	'V',
	'W',
	'X',
	'Y',
	'Z',
	'ㄱ',
	'ㄲ',
	'ㄴ',
	'ㄷ',
	'ㄸ',
	'ㄹ',
	'ㅁ',
	'ㅂ',
	'ㅃ',
	'ㅅ',
	'ㅆ',
	'ㅇ',
	'ㅈ',
	'ㅉ',
	'ㅊ',
	'ㅋ',
	'ㅌ',
	'ㅍ',
	'ㅎ'
];

export const ANONYMOUS_NAME = '익명의 켄텍인';

export function createDisplayName(
	user: User,
	displayType: DisplayType,
	userIdToIdx?: Map<string, number>
): string {
	if (user.deletedAt) return '탈퇴한 사용자';

	switch (displayType) {
		case 'anonymous': {
			if (!userIdToIdx) return ANONYMOUS_NAME;
			const anonIdx = userIdToIdx.get(user._id);
			return anonIdx ? `${ANONYMOUS_NAME} ${anonIdx}` : ANONYMOUS_NAME;
		}
		case 'realName': {
			const id = user.email.split('@')[0];
			const maskedId = id.slice(0, Math.min(Math.max(id.length - 4, 0), 4)) + '****';
			return `${user.realName} (${maskedId})`;
		}
		case 'nickname':
			return user.nickname;
		case 'email':
			return user.email;
		default:
			return user.nickname;
	}
}
