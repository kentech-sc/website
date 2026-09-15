import { and, eq, inArray, lt, notExists } from 'drizzle-orm';

import { asEntity } from './repository.utils.js';

import type { FileId, FileMetaCreate, FileMetaEntity } from '$lib/types/file-meta.type.js';
import type { PostId } from '$lib/types/post.type.js';
import type { SubmissionId } from '$lib/types/submission.type.js';

import {
	banners,
	fileMetas,
	postFiles,
	posts,
	submissionFiles,
	submissions
} from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';

type FileRow = typeof fileMetas.$inferSelect;

function withArticleIds(row: FileRow, articleIds: string[]): FileMetaEntity {
	return asEntity<FileMetaEntity>({ ...row, articleIds });
}

export async function createFileMeta(fileMeta: FileMetaCreate): Promise<FileMetaEntity> {
	const [created] = await getDatabase().insert(fileMetas).values(fileMeta).returning();
	return withArticleIds(created, []);
}

export async function findFileMetasByFileIds(
	fileIds: FileId[]
): Promise<Array<FileMetaEntity | null>> {
	if (fileIds.length === 0) return [];
	const rows = await getDatabase().select().from(fileMetas).where(inArray(fileMetas.id, fileIds));
	const fileIdToFile = new Map(rows.map((file) => [file.id, withArticleIds(file, [])]));
	return fileIds.map((fileId) => fileIdToFile.get(fileId) ?? null);
}

export async function findFileMetasByArticleId(
	articleId: PostId | SubmissionId
): Promise<FileMetaEntity[]> {
	const [postRows, submissionRows] = await Promise.all([
		getDatabase()
			.select({ file: fileMetas })
			.from(postFiles)
			.innerJoin(fileMetas, eq(postFiles.fileId, fileMetas.id))
			.where(eq(postFiles.postId, articleId)),
		getDatabase()
			.select({ file: fileMetas })
			.from(submissionFiles)
			.innerJoin(fileMetas, eq(submissionFiles.fileId, fileMetas.id))
			.where(eq(submissionFiles.submissionId, articleId))
	]);
	return [...postRows, ...submissionRows].map(({ file }) => withArticleIds(file, [articleId]));
}

export async function findFilePresenceEntriesByArticleIds(
	articleIds: Array<PostId | SubmissionId>
): Promise<Array<Pick<FileMetaEntity, 'articleIds' | 'mime'>>> {
	if (articleIds.length === 0) return [];
	const [postRows, submissionRows] = await Promise.all([
		getDatabase()
			.select({ articleId: postFiles.postId, mime: fileMetas.mime })
			.from(postFiles)
			.innerJoin(fileMetas, eq(postFiles.fileId, fileMetas.id))
			.where(inArray(postFiles.postId, articleIds)),
		getDatabase()
			.select({ articleId: submissionFiles.submissionId, mime: fileMetas.mime })
			.from(submissionFiles)
			.innerJoin(fileMetas, eq(submissionFiles.fileId, fileMetas.id))
			.where(inArray(submissionFiles.submissionId, articleIds))
	]);
	return [...postRows, ...submissionRows].map(({ articleId, mime }) => ({
		articleIds: [articleId],
		mime
	}));
}

export async function deleteFileMetasByFileIds(fileIds: FileId[]): Promise<boolean> {
	if (fileIds.length === 0) return false;
	const rows = await getDatabase()
		.delete(fileMetas)
		.where(inArray(fileMetas.id, fileIds))
		.returning({ id: fileMetas.id });
	return rows.length > 0;
}

export async function addArticleIdToFiles(
	fileIds: FileId[],
	articleId: PostId | SubmissionId
): Promise<boolean> {
	if (fileIds.length === 0) return false;
	const [post] = await getDatabase()
		.select({ id: posts.id })
		.from(posts)
		.where(eq(posts.id, articleId))
		.limit(1);
	if (post) {
		const rows = await getDatabase()
			.insert(postFiles)
			.values(fileIds.map((fileId) => ({ postId: articleId, fileId })))
			.onConflictDoNothing()
			.returning();
		return rows.length > 0;
	}

	const [submission] = await getDatabase()
		.select({ id: submissions.id })
		.from(submissions)
		.where(eq(submissions.id, articleId))
		.limit(1);
	if (!submission) return false;
	const rows = await getDatabase()
		.insert(submissionFiles)
		.values(fileIds.map((fileId) => ({ submissionId: articleId, fileId })))
		.onConflictDoNothing()
		.returning();
	return rows.length > 0;
}

export async function removeArticleIdFromAllFiles(
	articleId: PostId | SubmissionId
): Promise<boolean> {
	const [postRows, submissionRows] = await Promise.all([
		getDatabase()
			.delete(postFiles)
			.where(eq(postFiles.postId, articleId))
			.returning({ fileId: postFiles.fileId }),
		getDatabase()
			.delete(submissionFiles)
			.where(eq(submissionFiles.submissionId, articleId))
			.returning({ fileId: submissionFiles.fileId })
	]);
	return postRows.length + submissionRows.length > 0;
}

export async function findOrphanedFiles(cutoffTime: string): Promise<FileMetaEntity[]> {
	const rows = await getDatabase()
		.select()
		.from(fileMetas)
		.where(
			and(
				lt(fileMetas.createdAt, cutoffTime),
				notExists(getDatabase().select().from(postFiles).where(eq(postFiles.fileId, fileMetas.id))),
				notExists(
					getDatabase()
						.select()
						.from(submissionFiles)
						.where(eq(submissionFiles.fileId, fileMetas.id))
				),
				// 배너 이미지는 게시글에 붙지 않아 여기서 빼지 않으면 하루 뒤 지워진다.
				notExists(getDatabase().select().from(banners).where(eq(banners.fileId, fileMetas.id)))
			)
		);
	return rows.map((row) => withArticleIds(row, []));
}
