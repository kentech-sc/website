import type { CommentEntity } from './comment.type.js';
import type { FileId } from './file-meta.type.js';
import type { PostEntity } from './post.type.js';
import type { ReviewEntity } from './review.type.js';
import type { SubmissionEntity } from './submission.type.js';
import type { UserId } from './user.type.js';

type ActivityTarget =
	| 'post'
	| 'comment'
	| 'review'
	| 'petition'
	| 'petition-response'
	| 'submission'
	| 'submission-response';
type ActivityCause = 'direct' | 'post-delete-cascade';

interface PostLogSnapshot extends PostEntity {
	fileIds: FileId[];
}

interface SubmissionLogSnapshot extends SubmissionEntity {
	fileIds: FileId[];
}

type SubmissionResponseSnapshot = Pick<
	SubmissionEntity,
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
	| CreateActivityLog<'petition', SubmissionLogSnapshot>
	| EditActivityLog<'petition', SubmissionLogSnapshot>
	| DeleteActivityLog<'petition', SubmissionLogSnapshot>
	| CreateActivityLog<'petition-response', SubmissionResponseSnapshot>
	| EditActivityLog<'petition-response', SubmissionResponseSnapshot>
	| DeleteActivityLog<'petition-response', SubmissionResponseSnapshot>
	| CreateActivityLog<'submission', SubmissionLogSnapshot>
	| DeleteActivityLog<'submission', SubmissionLogSnapshot>
	| CreateActivityLog<'submission-response', SubmissionResponseSnapshot>
	| EditActivityLog<'submission-response', SubmissionResponseSnapshot>
	| DeleteActivityLog<'submission-response', SubmissionResponseSnapshot>;

export type ActivityLogEntity = ActivityLogCreate & {
	id: number;
	createdAt: string;
};
