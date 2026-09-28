import { and, asc, desc, eq, ilike, inArray, notExists, or, sql } from 'drizzle-orm';

import { firstOrNull } from './repository.utils.js';

import type {
	SubmissionCreate,
	SubmissionEntity,
	SubmissionId,
	SubmissionKind,
	SubmissionPreview,
	SubmissionStatus,
	SubmissionUpdate
} from '$lib/types/submission.type.js';
import type { UserId } from '$lib/types/user.type.js';

import { submissionSupports, submissions } from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';

type SubmissionRow = typeof submissions.$inferSelect;

async function hydrate(rows: SubmissionRow[]): Promise<SubmissionEntity[]> {
	if (rows.length === 0) return [];

	const supports = await getDatabase()
		.select()
		.from(submissionSupports)
		.where(
			inArray(
				submissionSupports.submissionId,
				rows.map(({ id }) => id)
			)
		)
		.orderBy(asc(submissionSupports.createdAt));

	const supporterIdsBySubmission = new Map<SubmissionId, UserId[]>();
	for (const support of supports) {
		const supporterIds = supporterIdsBySubmission.get(support.submissionId) ?? [];
		supporterIds.push(support.userId);
		supporterIdsBySubmission.set(support.submissionId, supporterIds);
	}

	return rows.map((row) => ({
		...row,
		kind: row.kind as SubmissionKind,
		category: row.category as SubmissionEntity['category'],
		authorNameMode: row.authorNameMode as SubmissionEntity['authorNameMode'],
		status: row.status as SubmissionStatus,
		supporterIds: supporterIdsBySubmission.get(row.id) ?? []
	}));
}

function kindFilter(kinds: SubmissionKind[]) {
	return inArray(submissions.kind, kinds);
}

function searchFilter(query: string, kinds: SubmissionKind[]) {
	const pattern = `%${query}%`;
	return and(
		kindFilter(kinds),
		or(
			ilike(submissions.title, pattern),
			ilike(submissions.content, pattern),
			ilike(submissions.response, pattern)
		)
	);
}

async function findHydratedById(submissionId: SubmissionId): Promise<SubmissionEntity | null> {
	const rows = await getDatabase()
		.select()
		.from(submissions)
		.where(eq(submissions.id, submissionId))
		.limit(1);
	return firstOrNull(await hydrate(rows));
}

export async function countSubmissions(kinds: SubmissionKind[]): Promise<number> {
	const [result] = await getDatabase()
		.select({ count: sql<number>`count(*)::int` })
		.from(submissions)
		.where(kindFilter(kinds));
	return result.count;
}

export async function countSubmissionsByQuery(
	query: string,
	kinds: SubmissionKind[]
): Promise<number> {
	const [result] = await getDatabase()
		.select({ count: sql<number>`count(*)::int` })
		.from(submissions)
		.where(searchFilter(query, kinds));
	return result.count;
}

export async function createSubmission(input: SubmissionCreate): Promise<SubmissionEntity> {
	const [created] = await getDatabase().insert(submissions).values(input).returning();
	return (await hydrate([created]))[0];
}

export async function findSubmissionById(
	submissionId: SubmissionId
): Promise<SubmissionEntity | null> {
	return await findHydratedById(submissionId);
}

export async function findRecentSubmissions(
	kinds: SubmissionKind[],
	limit: number,
	skip = 0
): Promise<SubmissionEntity[]> {
	const rows = await getDatabase()
		.select()
		.from(submissions)
		.where(kindFilter(kinds))
		.orderBy(desc(submissions.createdAt))
		.offset(skip)
		.limit(limit);
	return await hydrate(rows);
}

export async function findRecentSubmissionPreviews(
	kinds: SubmissionKind[],
	limit: number
): Promise<SubmissionPreview[]> {
	const rows = await getDatabase()
		.select({
			id: submissions.id,
			kind: submissions.kind,
			category: submissions.category,
			title: submissions.title,
			status: submissions.status,
			createdAt: submissions.createdAt,
			supportCount: sql<number>`(
				select count(*)::int
				from ${submissionSupports}
				where ${submissionSupports.submissionId} = ${submissions.id}
			)`
		})
		.from(submissions)
		.where(kindFilter(kinds))
		.orderBy(desc(submissions.createdAt))
		.limit(limit);

	return rows.map((row) => ({
		...row,
		kind: row.kind as SubmissionKind,
		category: row.category as SubmissionEntity['category'],
		status: row.status as SubmissionStatus
	}));
}

export async function deleteSubmissionById(submissionId: SubmissionId): Promise<boolean> {
	const rows = await getDatabase()
		.delete(submissions)
		.where(eq(submissions.id, submissionId))
		.returning({ id: submissions.id });
	return rows.length > 0;
}

export async function deleteSubmissionWithoutSupportById(
	submissionId: SubmissionId
): Promise<boolean> {
	const database = getDatabase();
	const rows = await database
		.delete(submissions)
		.where(
			and(
				eq(submissions.id, submissionId),
				eq(submissions.status, 'ongoing'),
				notExists(
					database
						.select({ id: submissionSupports.submissionId })
						.from(submissionSupports)
						.where(eq(submissionSupports.submissionId, submissionId))
				)
			)
		)
		.returning({ id: submissions.id });
	return rows.length > 0;
}

export async function updateSubmissionWithoutSupportById(
	submissionId: SubmissionId,
	input: SubmissionUpdate
): Promise<SubmissionEntity | null> {
	const database = getDatabase();
	const rows = await database
		.update(submissions)
		.set({ ...input, updatedAt: sql`now()` })
		.where(
			and(
				eq(submissions.id, submissionId),
				eq(submissions.status, 'ongoing'),
				notExists(
					database
						.select({ id: submissionSupports.submissionId })
						.from(submissionSupports)
						.where(eq(submissionSupports.submissionId, submissionId))
				)
			)
		)
		.returning();
	return firstOrNull(await hydrate(rows));
}

export async function viewSubmissionById(
	submissionId: SubmissionId
): Promise<SubmissionEntity | null> {
	const rows = await getDatabase()
		.update(submissions)
		.set({ viewCount: sql`${submissions.viewCount} + 1`, updatedAt: sql`now()` })
		.where(eq(submissions.id, submissionId))
		.returning();
	return firstOrNull(await hydrate(rows));
}

export async function searchSubmissionsByQuery(
	query: string,
	kinds: SubmissionKind[],
	limit = 10,
	skip = 0
): Promise<Array<SubmissionEntity & { searchScore?: number }>> {
	const rows = await getDatabase()
		.select()
		.from(submissions)
		.where(searchFilter(query, kinds))
		.orderBy(desc(submissions.createdAt))
		.offset(skip)
		.limit(limit);
	return (await hydrate(rows)).map((submission) => ({ ...submission, searchScore: 1 }));
}
