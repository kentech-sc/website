import type { UserId } from './user.type.js';

export const PetitionStatus = {
	Ongoing: 'ongoing',
	Pending: 'pending',
	Reviewing: 'reviewing',
	Answered: 'answered',
	Expired: 'expired'
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

export type Petition = PetitionEntity & {
	petitionerName: string | null;
	responderName: string | null;
};

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
