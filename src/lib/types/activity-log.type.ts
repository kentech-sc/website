import type { CommentEntity } from './comment.type.js';
import type { FileId } from './file-meta.type.js';
import type { PetitionEntity } from './petition.type.js';
import type { PostEntity } from './post.type.js';
import type { ReviewEntity } from './review.type.js';
import type { UserId } from './user.type.js';

type ActivityTarget = 'post' | 'comment' | 'review' | 'petition' | 'petition-response';
type ActivityCause = 'direct' | 'post-delete-cascade';

interface PostLogSnapshot extends PostEntity {
	fileIds: FileId[];
}

interface PetitionLogSnapshot extends PetitionEntity {
	fileIds: FileId[];
}

type PetitionResponseSnapshot = Pick<
	PetitionEntity,
	'responderId' | 'response' | 'answeredAt' | 'status'
>;

interface ActivityLogCommon<TTarget extends ActivityTarget> {
	actorId: UserId;
	targetType: TTarget;
	targetId: string;
	cause: ActivityCause;
}

type CreateActivityLog<TTarget extends ActivityTarget, TSnapshot> = ActivityLogCommon<TTarget> & {
	action: 'create';
	beforeSnapshot: null;
	afterSnapshot: TSnapshot;
};

type EditActivityLog<TTarget extends ActivityTarget, TSnapshot> = ActivityLogCommon<TTarget> & {
	action: 'edit';
	beforeSnapshot: TSnapshot;
	afterSnapshot: TSnapshot;
};

type DeleteActivityLog<TTarget extends ActivityTarget, TSnapshot> = ActivityLogCommon<TTarget> & {
	action: 'delete';
	beforeSnapshot: TSnapshot;
	afterSnapshot: null;
};

export type ActivityLogCreate =
	| CreateActivityLog<'post', PostLogSnapshot>
	| EditActivityLog<'post', PostLogSnapshot>
	| DeleteActivityLog<'post', PostLogSnapshot>
	| CreateActivityLog<'comment', CommentEntity>
	| EditActivityLog<'comment', CommentEntity>
	| DeleteActivityLog<'comment', CommentEntity>
	| CreateActivityLog<'review', ReviewEntity>
	| EditActivityLog<'review', ReviewEntity>
	| DeleteActivityLog<'review', ReviewEntity>
	| CreateActivityLog<'petition', PetitionLogSnapshot>
	| EditActivityLog<'petition', PetitionLogSnapshot>
	| DeleteActivityLog<'petition', PetitionLogSnapshot>
	| CreateActivityLog<'petition-response', PetitionResponseSnapshot>
	| EditActivityLog<'petition-response', PetitionResponseSnapshot>
	| DeleteActivityLog<'petition-response', PetitionResponseSnapshot>;

export type ActivityLogEntity = ActivityLogCreate & {
	_id: string;
	createdAt: string;
};
