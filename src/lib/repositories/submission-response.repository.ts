import { and, eq, sql } from 'drizzle-orm';

import type { SubmissionEntity, SubmissionId } from '$lib/types/submission.type.js';
import type { UserId } from '$lib/types/user.type.js';

import { findSubmissionById } from '$lib/repositories/submission.repository.js';
import { submissions } from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';

async function findAfterUpdate(rows: { id: SubmissionId }[], submissionId: SubmissionId) {
	if (rows.length === 0) return null;
	return await findSubmissionById(submissionId);
}

export async function updateSubmissionStatusById(
	submissionId: SubmissionId,
	currentStatus: SubmissionEntity['status'],
	nextStatus: SubmissionEntity['status']
): Promise<SubmissionEntity | null> {
	const rows = await getDatabase()
		.update(submissions)
		.set({ status: nextStatus, updatedAt: sql`now()` })
		.where(and(eq(submissions.id, submissionId), eq(submissions.status, currentStatus)))
		.returning({ id: submissions.id });
	return await findAfterUpdate(rows, submissionId);
}

export async function respondToSubmissionById(
	submissionId: SubmissionId,
	responderId: UserId,
	response: string,
	answeredAt: string
): Promise<SubmissionEntity | null> {
	const rows = await getDatabase()
		.update(submissions)
		.set({ responderId, response, status: 'answered', answeredAt, updatedAt: sql`now()` })
		.where(
			and(
				eq(submissions.id, submissionId),
				eq(submissions.status, 'reviewing'),
				sql`${submissions.responderId} is null`
			)
		)
		.returning({ id: submissions.id });
	return await findAfterUpdate(rows, submissionId);
}

export async function reviseSubmissionResponseById(
	submissionId: SubmissionId,
	responderId: UserId,
	response: string,
	answeredAt: string
): Promise<SubmissionEntity | null> {
	const rows = await getDatabase()
		.update(submissions)
		.set({ responderId, response, answeredAt, updatedAt: sql`now()` })
		.where(and(eq(submissions.id, submissionId), sql`${submissions.responderId} is not null`))
		.returning({ id: submissions.id });
	return await findAfterUpdate(rows, submissionId);
}

export async function deleteSubmissionResponseById(
	submissionId: SubmissionId
): Promise<SubmissionEntity | null> {
	const rows = await getDatabase()
		.update(submissions)
		.set({
			responderId: null,
			response: null,
			status: 'reviewing',
			answeredAt: null,
			updatedAt: sql`now()`
		})
		.where(and(eq(submissions.id, submissionId), sql`${submissions.responderId} is not null`))
		.returning({ id: submissions.id });
	return await findAfterUpdate(rows, submissionId);
}
