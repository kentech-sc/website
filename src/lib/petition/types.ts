import type { UserId } from '$lib/user/types';
import type { UpdateQuery } from 'mongoose';
import type { Types } from 'mongoose';

export type PetitionStatus =
	| 'ongoing' // 아직 진행 중 (기준 미달)
	| 'pending' // 기준 충족 → 답변 대기
	| 'reviewing' // 기준 충족 → 검토 중
	| 'answered' // 답변 완료
	| 'expired'; // 기준 미달 + 기간 만료로 종료

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
