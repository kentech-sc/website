import type { Meetup, MeetupId, MeetupResponse, MeetupSummary } from '$lib/types/meetup.type.js';
import type { User } from '$lib/types/user.type.js';

import * as MeetupRepository from '$lib/repositories/meetup.repository.js';
import * as MeetupRule from '$lib/rules/meetup.rule.js';
import { AppError, assertRule } from '$lib/server/errors.js';
import {
	MEETUP_SLOT_MINUTES,
	MEETUP_TITLE_MAX_LENGTH,
	getSlotsPerDay,
	normalizeMeetupDays,
	normalizeSlots
} from '$lib/shared/meetup.js';
import { APP_ERROR } from '$lib/shared/rule.js';
import { MeetupMode } from '$lib/types/meetup.type.js';

export interface MeetupInput {
	title: string;
	mode: string;
	days: string[];
	startMinute: number;
	endMinute: number;
}

function isMeetupMode(mode: string): mode is MeetupMode {
	return mode === MeetupMode.Dates || mode === MeetupMode.Weekdays;
}

function isValidTimeRange(startMinute: number, endMinute: number): boolean {
	return (
		Number.isInteger(startMinute) &&
		Number.isInteger(endMinute) &&
		startMinute >= 0 &&
		endMinute <= 24 * 60 &&
		startMinute < endMinute &&
		startMinute % MEETUP_SLOT_MINUTES === 0 &&
		endMinute % MEETUP_SLOT_MINUTES === 0
	);
}

export async function create(input: MeetupInput, user: User): Promise<Meetup> {
	assertRule(MeetupRule.canUseMeetup(user));

	const title = input.title.trim();
	if (!title || title.length > MEETUP_TITLE_MAX_LENGTH) {
		throw new AppError(
			APP_ERROR.BAD_REQUEST,
			`제목은 1~${MEETUP_TITLE_MAX_LENGTH}자로 입력해 주세요.`
		);
	}
	if (!isMeetupMode(input.mode)) {
		throw new AppError(APP_ERROR.BAD_REQUEST, '날짜 방식이 올바르지 않습니다.');
	}
	const days = normalizeMeetupDays(input.mode, input.days);
	if (!days) {
		throw new AppError(APP_ERROR.BAD_REQUEST, '날짜나 요일을 1~14개 골라 주세요.');
	}
	if (!isValidTimeRange(input.startMinute, input.endMinute)) {
		throw new AppError(APP_ERROR.BAD_REQUEST, '종료 시각은 시작 시각보다 늦어야 합니다.');
	}

	return await MeetupRepository.createMeetup({
		creatorId: user.id,
		title,
		mode: input.mode,
		days,
		startMinute: input.startMinute,
		endMinute: input.endMinute
	});
}

export async function get(id: MeetupId, user: User): Promise<Meetup> {
	assertRule(MeetupRule.canUseMeetup(user));
	const meetup = await MeetupRepository.findMeetup(id);
	if (!meetup) throw new AppError(APP_ERROR.NOT_FOUND, '삭제되었거나 없는 일정입니다.');
	return meetup;
}

export async function findResponses(meetup: Meetup): Promise<MeetupResponse[]> {
	return await MeetupRepository.findMeetupResponses(meetup.id);
}

export async function findMine(user: User): Promise<MeetupSummary[]> {
	assertRule(MeetupRule.canUseMeetup(user));
	return await MeetupRepository.findUserMeetups(user.id);
}

export async function respond(id: MeetupId, slots: number[], user: User): Promise<void> {
	const meetup = await get(id, user);
	const totalSlots = meetup.days.length * getSlotsPerDay(meetup.startMinute, meetup.endMinute);
	const normalizedSlots = normalizeSlots(slots, totalSlots);
	if (!normalizedSlots) {
		throw new AppError(APP_ERROR.BAD_REQUEST, '고른 시간이 일정 범위를 벗어났습니다.');
	}
	// 빈 응답을 남겨 두면 응답자 수에 들어가 '모두 가능한 시간'이 사라지므로 응답 취소로 본다.
	if (!normalizedSlots.length) {
		await MeetupRepository.deleteMeetupResponse(meetup.id, user.id);
		return;
	}
	await MeetupRepository.upsertMeetupResponse(meetup.id, user.id, normalizedSlots);
}

export function canDelete(meetup: Meetup, user: User): boolean {
	return MeetupRule.canDeleteMeetup(meetup, user).ok;
}

export async function remove(id: MeetupId, user: User): Promise<void> {
	const meetup = await get(id, user);
	assertRule(MeetupRule.canDeleteMeetup(meetup, user));
	const deleted = await MeetupRepository.deleteMeetup(meetup.id, user.id);
	if (!deleted) throw new AppError(APP_ERROR.INVALID_STATE, '이미 삭제된 일정입니다.');
}
