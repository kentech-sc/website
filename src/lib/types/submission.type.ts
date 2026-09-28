import type { AuthorNameMode, UserId } from './user.type.js';

export const SubmissionKind = {
	Petition: 'petition',
	Feedback: 'feedback'
} as const;

export type SubmissionKind = (typeof SubmissionKind)[keyof typeof SubmissionKind];

export const SubmissionCategory = {
	Executive: 'executive',
	Education: 'education',
	Clubs: 'clubs',
	Audit: 'audit',
	Election: 'election',
	Website: 'website',
	Other: 'other'
} as const;

export type SubmissionCategory = (typeof SubmissionCategory)[keyof typeof SubmissionCategory];

export const SubmissionStatus = {
	Ongoing: 'ongoing',
	Pending: 'pending',
	Reviewing: 'reviewing',
	Answered: 'answered',
	Expired: 'expired'
} as const;

export type SubmissionStatus = (typeof SubmissionStatus)[keyof typeof SubmissionStatus];
export type SubmissionId = string;

export interface SubmissionCreate {
	kind: SubmissionKind;
	category: SubmissionCategory | null;
	authorNameMode: AuthorNameMode;
	title: string;
	content: string;
	authorId: UserId;
}

export interface SubmissionEntity extends SubmissionCreate {
	id: SubmissionId;
	createdAt: string;
	updatedAt: string;
	status: SubmissionStatus;
	viewCount: number;
	supporterIds: UserId[];
	responderId: UserId | null;
	response: string | null;
	answeredAt: string | null;
}

export type SubmissionUpdate = Partial<
	Pick<SubmissionEntity, 'kind' | 'category' | 'authorNameMode' | 'title' | 'content'>
>;

export type SubmissionPreview = Pick<
	SubmissionEntity,
	'id' | 'kind' | 'category' | 'title' | 'status' | 'createdAt'
> & { supportCount: number };

export type Submission = SubmissionEntity & {
	authorName: string | null;
	responderName: string | null;
};

export interface SubmissionPermissions {
	canEdit: boolean;
	canDelete: boolean;
	canSupport: boolean;
	canCancelSupport: boolean;
	canReview: boolean;
	canCancelReview: boolean;
	canRespond: boolean;
	canEditResponse: boolean;
	canDeleteResponse: boolean;
}
