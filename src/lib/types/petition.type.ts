import type { UserId } from './user.type.js';

export const PetitionStatus = {
	Ongoing: 'ongoing', // 아직 진행 중 (기준 미달)
	Pending: 'pending', // 기준 충족 → 답변 대기
	Reviewing: 'reviewing', // 답변 대기 → 검토 중
	Answered: 'answered', // 답변 완료
	Expired: 'expired' // 기준 미달 + 기간 만료로 종료
} as const;

export type PetitionStatus = (typeof PetitionStatus)[keyof typeof PetitionStatus];

export type PetitionId = string;

export interface PetitionCreate {
	title: string;
	content: string;
	petitionerId: UserId;
}

export interface PetitionEntity extends PetitionCreate {
	_id: PetitionId;
	createdAt: string;
	updatedAt: string;

	status: PetitionStatus;
	viewCnt: number;
	signedBy: UserId[];

	responderId: UserId | null;
	response: string | null;

	answeredAt: string | null;
}

export interface Petition extends PetitionEntity {
	signCnt: number;

	petitionerName: string | null;
	responderName: string | null;
}

export interface PetitionPermissions {
	canDelete: boolean;
	canSign: boolean;
	canUnsign: boolean;
	canReview: boolean;
	canUnreview: boolean;
	canRespond: boolean;
	canEditResponse: boolean;
	canDeleteResponse: boolean;
}

export type PetitionUpdate = Partial<
	Pick<
		PetitionEntity,
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
