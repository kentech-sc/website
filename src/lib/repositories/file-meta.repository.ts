import { and, eq, inArray, lt, notExists } from 'drizzle-orm';

import { asEntity } from './repository.utils.js';

import type { FileId, FileMetaCreate, FileMetaEntity } from '$lib/types/file-meta.type.js';
import type { PetitionId } from '$lib/types/petition.type.js';
import type { PostId } from '$lib/types/post.type.js';

import {
	fileMetas,
	petitionFiles,
	petitions,
	postFiles,
	posts
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
	articleId: PostId | PetitionId
): Promise<FileMetaEntity[]> {
	const [postRows, petitionRows] = await Promise.all([
		getDatabase()
			.select({ file: fileMetas })
			.from(postFiles)
			.innerJoin(fileMetas, eq(postFiles.fileId, fileMetas.id))
			.where(eq(postFiles.postId, articleId)),
		getDatabase()
			.select({ file: fileMetas })
			.from(petitionFiles)
			.innerJoin(fileMetas, eq(petitionFiles.fileId, fileMetas.id))
			.where(eq(petitionFiles.petitionId, articleId))
	]);
	return [...postRows, ...petitionRows].map(({ file }) => withArticleIds(file, [articleId]));
}

export async function findFilePresenceEntriesByArticleIds(
	articleIds: Array<PostId | PetitionId>
): Promise<Array<Pick<FileMetaEntity, 'articleIds' | 'mime'>>> {
	if (articleIds.length === 0) return [];
	const [postRows, petitionRows] = await Promise.all([
		getDatabase()
			.select({ articleId: postFiles.postId, mime: fileMetas.mime })
			.from(postFiles)
			.innerJoin(fileMetas, eq(postFiles.fileId, fileMetas.id))
			.where(inArray(postFiles.postId, articleIds)),
		getDatabase()
			.select({ articleId: petitionFiles.petitionId, mime: fileMetas.mime })
			.from(petitionFiles)
			.innerJoin(fileMetas, eq(petitionFiles.fileId, fileMetas.id))
			.where(inArray(petitionFiles.petitionId, articleIds))
	]);
	return [...postRows, ...petitionRows].map(({ articleId, mime }) => ({
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
	articleId: PostId | PetitionId
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

	const [petition] = await getDatabase()
		.select({ id: petitions.id })
		.from(petitions)
		.where(eq(petitions.id, articleId))
		.limit(1);
	if (!petition) return false;
	const rows = await getDatabase()
		.insert(petitionFiles)
		.values(fileIds.map((fileId) => ({ petitionId: articleId, fileId })))
		.onConflictDoNothing()
		.returning();
	return rows.length > 0;
}

export async function removeArticleIdFromAllFiles(
	articleId: PostId | PetitionId
): Promise<boolean> {
	const [postRows, petitionRows] = await Promise.all([
		getDatabase()
			.delete(postFiles)
			.where(eq(postFiles.postId, articleId))
			.returning({ fileId: postFiles.fileId }),
		getDatabase()
			.delete(petitionFiles)
			.where(eq(petitionFiles.petitionId, articleId))
			.returning({ fileId: petitionFiles.fileId })
	]);
	return postRows.length + petitionRows.length > 0;
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
					getDatabase().select().from(petitionFiles).where(eq(petitionFiles.fileId, fileMetas.id))
				)
			)
		);
	return rows.map((row) => withArticleIds(row, []));
}
