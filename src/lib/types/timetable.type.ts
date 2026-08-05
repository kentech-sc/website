import type { Offering, OfferingId, TimetableId } from './academic.type.js';
import type { UserId } from './user.type.js';

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
}

export interface TimetableCreate {
	userId: UserId;
	year: number;
	term: number;
	name: string;
	position: number;
}

export interface TimetableItemCreate {
	timetableId: TimetableId;
	offeringId: OfferingId;
}
