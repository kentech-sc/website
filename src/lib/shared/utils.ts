import type { DisplayType, User } from '$lib/types/user.type.js';

export function toPojo<T>(data: unknown): T {
	if (data === undefined || data === null) return data as T;
	return JSON.parse(JSON.stringify(data)) as T;
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

const ANONYMOUS_NAME = '익명의 켄텍인';

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
