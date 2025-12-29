import type { Types, UpdateQuery } from 'mongoose';

import type { FileId } from './file-meta.type.js';
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

export interface PetitionCreate {
	title: string;
	content: string;
	petitionerId: UserId;
	files: FileId[];
}

export interface PetitionDoc extends PetitionCreate {
	_id: PetitionId;
	createdAt: Date;
	updatedAt: Date;

	status: PetitionStatus;
	viewCnt: number;
	signedBy: UserId[];

	responderId: UserId | null;
	response: string | null;

	answeredAt: Date | null;
}

export interface Petition extends PetitionDoc {
	signCnt: number;

	petitionerName: string | null;
	responderName: string | null;
}

export type PetitionUpdate = UpdateQuery<
	Pick<
		PetitionDoc,
		| 'title'
		| 'content'
		| 'status'
		| 'viewCnt'
		| 'signedBy'
		| 'responderId'
		| 'response'
		| 'answeredAt'
	>
>;
