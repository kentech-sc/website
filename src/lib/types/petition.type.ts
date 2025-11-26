import type { Types, UpdateQuery } from 'mongoose';

import type { UserId } from './user.type.js';

export const PetitionStatus = {
	Ongoing: 'ongoing', // 아직 진행 중 (기준 미달)
	Pending: 'pending', // 기준 충족 → 답변 대기
	Reviewing: 'reviewing', // 답변 대기 → 검토 중
	Answered: 'answered', // 답변 완료
	Expired: 'expired' // 기준 미달 + 기간 만료로 종료
} as const;

export type PetitionStatus = (typeof PetitionStatus)[keyof typeof PetitionStatus];

export type PetitionId = Types.ObjectId;

export interface PetitionBase {
	title: string;
	content: string;
	status: PetitionStatus;

	viewCnt: number;
	signCnt: number;
	signedBy: UserId[];

	petitionerId: UserId;
}

export interface Petition extends PetitionBase {
	_id: PetitionId;
	createdAt: Date;
	updatedAt: Date;

	petitionerName?: string | null;

	responderId: UserId | null;
	responderName?: string | null;
	response: string | null;

	answeredAt: Date | null;
}

export type PetitionCreate = PetitionBase;
export type PetitionUpdate = UpdateQuery<
	Pick<
		Petition,
		| 'title'
		| 'content'
		| 'status'
		| 'viewCnt'
		| 'signCnt'
		| 'signedBy'
		| 'responderId'
		| 'response'
		| 'answeredAt'
	>
>;
