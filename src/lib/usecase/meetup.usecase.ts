import type { Meetup, MeetupId } from '$lib/types/meetup.type.js';
import type { User } from '$lib/types/user.type.js';

import * as TimetableRepository from '$lib/repositories/timetable.repository.js';
import { transaction } from '$lib/server/db.js';
import * as MeetupService from '$lib/services/meetup.service.js';
import * as ThrottleService from '$lib/services/throttle.service.js';
import { getKstDayKey, getTermOfDay } from '$lib/shared/day-key.js';
import { MeetupMode } from '$lib/types/meetup.type.js';

/** 날짜 일정은 첫 후보 날짜, 요일 일정은 오늘이 속한 학기를 쓴다. */
function getTimetableTerm(meetup: Meetup) {
	return getTermOfDay(meetup.mode === MeetupMode.Dates ? meetup.days[0] : getKstDayKey());
}

export async function getListPage(user: User) {
	return { meetups: await MeetupService.findMine(user) };
}

export async function getDetailPage(id: MeetupId, user: User) {
	const meetup = await MeetupService.get(id, user);
	const timetableTerm = getTimetableTerm(meetup);
	const [responses, classMeetings] = await Promise.all([
		MeetupService.findResponses(meetup),
		TimetableRepository.findConfirmedMeetings(user.id, timetableTerm.year, timetableTerm.term)
	]);
	return {
		meetup,
		responses,
		/** 내 일정 표에 수업 시간을 표시하는 용도. 확정 시간표가 없으면 빈 배열. */
		classMeetings,
		timetableTerm,
		permissions: { canDelete: MeetupService.canDelete(meetup, user) }
	};
}

export async function create(input: MeetupService.MeetupInput, user: User) {
	return await transaction(async () => {
		await ThrottleService.reserve(user.id, 'article');
		return await MeetupService.create(input, user);
	});
}

export const respond = (id: MeetupId, slots: number[], user: User) =>
	MeetupService.respond(id, slots, user);

export const remove = (id: MeetupId, user: User) => MeetupService.remove(id, user);
