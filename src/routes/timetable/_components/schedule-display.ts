import type { Offering } from '$lib/types/academic.type.js';

const CATEGORY_COLORS: Record<string, string> = {
	EL: '#315f9e',
	EF: '#247f9f',
	VC: '#5b7f8d',
	MN: '#735f99',
	HASS: '#8b6b83',
	ESP: '#a45d7d',
	IR: '#b86446',
	CAPS: '#a44c3c',
	EN: '#6653a3',
	FR: '#647078',
	RC: '#39786f'
};

export const courseColor = (category: string | null) =>
	CATEGORY_COLORS[category ?? ''] ?? '#526777';

export const formatScheduleTime = (minutes: number) =>
	`${Math.floor(minutes / 60)
		.toString()
		.padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}`;

export const formatOfferingSchedule = (
	offering: Offering,
	weekdays = ['월', '화', '수', '목', '금']
) =>
	offering.meetings
		.map(
			(meeting) =>
				`${weekdays[meeting.weekday - 1] ?? meeting.weekday} ${formatScheduleTime(meeting.startsAt)}–${formatScheduleTime(meeting.endsAt)}${meeting.room ? ` · ${meeting.room}` : ''}`
		)
		.join(' / ');
