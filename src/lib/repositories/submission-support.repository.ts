import { and, eq, ne, notInArray, sql } from 'drizzle-orm';

import type { SubmissionEntity, SubmissionId } from '$lib/types/submission.type.js';
import type { UserId } from '$lib/types/user.type.js';

import { findSubmissionById } from '$lib/repositories/submission.repository.js';
import { submissionSupports, submissions } from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';

export async function supportSubmissionById(
	submissionId: SubmissionId,
	userId: UserId
): Promise<SubmissionEntity | null> {
	const inserted = await getDatabase()
		.insert(submissionSupports)
		.select(
			getDatabase()
				.select({
					submissionId: submissions.id,
					userId: sql<UserId>`${userId}::uuid`.as('user_id')
				})
				.from(submissions)
				.where(
					and(
						eq(submissions.id, submissionId),
						notInArray(submissions.status, ['answered', 'expired']),
						ne(submissions.authorId, userId)
					)
				)
		)
		.onConflictDoNothing()
		.returning({ submissionId: submissionSupports.submissionId });
	if (inserted.length === 0) return null;
	return await findSubmissionById(submissionId);
}

export async function cancelSubmissionSupportById(
	submissionId: SubmissionId,
	userId: UserId
): Promise<SubmissionEntity | null> {
	const deleted = await getDatabase()
		.delete(submissionSupports)
		.where(
			and(
				eq(submissionSupports.submissionId, submissionId),
				eq(submissionSupports.userId, userId),
				sql`exists (
					select 1 from ${submissions}
					where ${submissions.id} = ${submissionId}
						and ${submissions.status} not in ('answered', 'expired')
				)`
			)
		)
		.returning({ submissionId: submissionSupports.submissionId });
	if (deleted.length === 0) return null;
	return await findSubmissionById(submissionId);
}

export async function refreshSubmissionStatusById(
	submissionId: SubmissionId,
	currentStatus: SubmissionEntity['status'],
	supportCount: number,
	nextStatus: SubmissionEntity['status']
): Promise<SubmissionEntity | null> {
	const rows = await getDatabase()
		.update(submissions)
		.set({ status: nextStatus, updatedAt: sql`now()` })
		.where(
			and(
				eq(submissions.id, submissionId),
				eq(submissions.status, currentStatus),
				sql`(
					select count(*)::int from ${submissionSupports}
					where ${submissionSupports.submissionId} = ${submissionId}
				) = ${supportCount}`
			)
		)
		.returning({ id: submissions.id });
	if (rows.length === 0) return null;
	return await findSubmissionById(submissionId);
}
