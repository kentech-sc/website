import type { CommentEntity } from './comment.type.js';
import type { FileId } from './file-meta.type.js';
import type { PetitionEntity } from './petition.type.js';
import type { PostEntity } from './post.type.js';
import type { ReviewEntity } from './review.type.js';
import type { UserId } from './user.type.js';

export type ActivityAction = 'create' | 'edit' | 'delete';
export type ActivityTarget = 'post' | 'comment' | 'review' | 'petition' | 'petition-response';
export type ActivityCause = 'direct' | 'post-delete-cascade';

export interface PostLogSnapshot extends PostEntity {
	fileIds: FileId[];
}

export interface PetitionLogSnapshot extends PetitionEntity {
	fileIds: FileId[];
}

export type PetitionResponseSnapshot = Pick<
	PetitionEntity,
	'responderId' | 'response' | 'answeredAt' | 'status'
>;

interface ActivityLogBase {
	_id: string;
	actorId: UserId;
	action: ActivityAction;
	targetType: ActivityTarget;
	targetId: string;
	parentTargetId: string | null;
	cause: ActivityCause;
	createdAt: string;
}

export type ActivityLog =
	| (ActivityLogBase & {
			targetType: 'post';
			beforeSnapshot: PostLogSnapshot | null;
			afterSnapshot: PostLogSnapshot | null;
	  })
	| (ActivityLogBase & {
			targetType: 'comment';
			beforeSnapshot: CommentEntity | null;
			afterSnapshot: CommentEntity | null;
	  })
	| (ActivityLogBase & {
			targetType: 'review';
			beforeSnapshot: ReviewEntity | null;
			afterSnapshot: ReviewEntity | null;
	  })
	| (ActivityLogBase & {
			targetType: 'petition';
			beforeSnapshot: PetitionLogSnapshot | null;
			afterSnapshot: PetitionLogSnapshot | null;
	  })
	| (ActivityLogBase & {
			targetType: 'petition-response';
			beforeSnapshot: PetitionResponseSnapshot | null;
			afterSnapshot: PetitionResponseSnapshot | null;
	  });

type DistributiveOmit<T, K extends keyof any> = T extends unknown ? Omit<T, K> : never;

export type ActivityLogCreate = DistributiveOmit<ActivityLog, '_id' | 'createdAt'>;
