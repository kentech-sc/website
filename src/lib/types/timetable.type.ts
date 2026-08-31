import type { Offering, OfferingId, TimetableId } from './academic.type.js';
import type { UserId } from './user.type.js';

export type TimetableItemChangeReason = 'schedule_changed' | 'cancelled' | 'details_changed';

export interface Timetable {
	id: TimetableId;
	userId: UserId;
	year: number;
	term: number;
	name: string;
	position: number;
	isConfirmed: boolean;
	createdAt: string;
	updatedAt: string;
	offerings: Offering[];
	changeReasons: Partial<Record<OfferingId, TimetableItemChangeReason>>;
}

export interface TimetableCreate {
	userId: UserId;
	year: number;
	term: number;
	name: string;
	position: number;
}
