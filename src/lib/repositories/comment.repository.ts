import { desc, eq } from 'drizzle-orm';

import { asEntity, firstOrNull } from './repository.utils.js';

import type { CommentCreate, CommentEntity, CommentId } from '$lib/types/comment.type.js';
import type { PostId } from '$lib/types/post.type.js';

import { comments } from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';

export async function createComment(commentCreate: CommentCreate): Promise<CommentEntity> {
	const [comment] = await getDatabase().insert(comments).values(commentCreate).returning();
	return asEntity<CommentEntity>(comment);
}

export async function findCommentById(commentId: CommentId): Promise<CommentEntity | null> {
	const rows = await getDatabase()
		.select()
		.from(comments)
		.where(eq(comments.id, commentId))
		.limit(1);
	return asEntity<CommentEntity | null>(firstOrNull(rows));
}

export async function findCommentsByPostId(postId: PostId): Promise<CommentEntity[]> {
	const rows = await getDatabase()
		.select()
		.from(comments)
		.where(eq(comments.postId, postId))
		.orderBy(desc(comments.createdAt));
	return asEntity<CommentEntity[]>(rows);
}

export async function deleteCommentById(commentId: CommentId): Promise<boolean> {
	const rows = await getDatabase()
		.delete(comments)
		.where(eq(comments.id, commentId))
		.returning({ id: comments.id });
	return rows.length > 0;
}

export async function deleteCommentsByPostId(postId: PostId): Promise<boolean> {
	const rows = await getDatabase()
		.delete(comments)
		.where(eq(comments.postId, postId))
		.returning({ id: comments.id });
	return rows.length > 0;
}
