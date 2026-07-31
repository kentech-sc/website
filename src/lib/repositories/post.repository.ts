import { and, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';

import { asEntity, firstOrNull } from './repository.utils.js';

import type { BoardId } from '$lib/types/board.type.js';
import type { PostCreate, PostEntity, PostId, PostUpdate } from '$lib/types/post.type.js';
import type { UserId } from '$lib/types/user.type.js';

import { postLikes, posts } from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';

type PostRow = typeof posts.$inferSelect;

async function hydratePosts(rows: PostRow[]): Promise<PostEntity[]> {
	if (rows.length === 0) return [];
	const likes = await getDatabase()
		.select()
		.from(postLikes)
		.where(
			inArray(
				postLikes.postId,
				rows.map(({ id }) => id)
			)
		);
	const postIdToUserIds = new Map<string, UserId[]>();
	for (const like of likes) {
		const userIds = postIdToUserIds.get(like.postId) ?? [];
		userIds.push(like.userId);
		postIdToUserIds.set(like.postId, userIds);
	}
	return rows.map((row) =>
		asEntity<PostEntity>({ ...row, likedBy: postIdToUserIds.get(row.id) ?? [] })
	);
}

function searchFilter(query: string) {
	const pattern = `%${query}%`;
	return or(ilike(posts.title, pattern), ilike(posts.content, pattern))!;
}

export async function countPostsByBoardId(boardId: BoardId): Promise<number> {
	const [result] = await getDatabase()
		.select({ count: sql<number>`count(*)::int` })
		.from(posts)
		.where(eq(posts.boardId, boardId));
	return result.count;
}

export async function countPostsByQuery(query: string): Promise<number> {
	const [result] = await getDatabase()
		.select({ count: sql<number>`count(*)::int` })
		.from(posts)
		.where(searchFilter(query));
	return result.count;
}

export async function createPost(post: PostCreate): Promise<PostEntity> {
	const [created] = await getDatabase().insert(posts).values(post).returning();
	return (await hydratePosts([created]))[0];
}

export async function findPostById(postId: PostId): Promise<PostEntity | null> {
	const rows = await getDatabase().select().from(posts).where(eq(posts.id, postId)).limit(1);
	const hydrated = await hydratePosts(rows);
	return firstOrNull(hydrated);
}

export async function findRecentPostsByBoardId(
	boardId: BoardId,
	limit: number,
	skip = 0
): Promise<PostEntity[]> {
	const rows = await getDatabase()
		.select()
		.from(posts)
		.where(eq(posts.boardId, boardId))
		.orderBy(desc(posts.createdAt))
		.offset(skip)
		.limit(limit);
	return await hydratePosts(rows);
}

export async function updatePostById(
	postId: PostId,
	postUpdate: PostUpdate
): Promise<PostEntity | null> {
	const rows = await getDatabase()
		.update(posts)
		.set({ ...postUpdate, updatedAt: sql`now()` })
		.where(eq(posts.id, postId))
		.returning();
	return firstOrNull(await hydratePosts(rows));
}

export async function incrementPostViewCntById(postId: PostId): Promise<PostEntity | null> {
	const rows = await getDatabase()
		.update(posts)
		.set({ viewCnt: sql`${posts.viewCnt} + 1`, updatedAt: sql`now()` })
		.where(eq(posts.id, postId))
		.returning();
	return firstOrNull(await hydratePosts(rows));
}

export async function incrementPostCommentCntById(
	postId: PostId,
	increment = 1
): Promise<PostEntity | null> {
	const rows = await getDatabase()
		.update(posts)
		.set({
			commentCnt: sql`${posts.commentCnt} + ${increment}`,
			updatedAt: sql`now()`
		})
		.where(and(eq(posts.id, postId), sql`${posts.commentCnt} + ${increment} >= 0`))
		.returning();
	return firstOrNull(await hydratePosts(rows));
}

export async function deletePostById(postId: PostId): Promise<boolean> {
	const rows = await getDatabase()
		.delete(posts)
		.where(eq(posts.id, postId))
		.returning({ id: posts.id });
	return rows.length > 0;
}

export async function likePostById(postId: PostId, userId: UserId): Promise<PostEntity | null> {
	const inserted = await getDatabase()
		.insert(postLikes)
		.values({ postId, userId })
		.onConflictDoNothing()
		.returning({ postId: postLikes.postId });
	if (inserted.length === 0) return null;
	return await findPostById(postId);
}

export async function unlikePostById(postId: PostId, userId: UserId): Promise<PostEntity | null> {
	const deleted = await getDatabase()
		.delete(postLikes)
		.where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
		.returning({ postId: postLikes.postId });
	if (deleted.length === 0) return null;
	return await findPostById(postId);
}

export async function searchPostsByQuery(
	query: string,
	limit = 10,
	skip = 0
): Promise<Array<PostEntity & { searchScore?: number }>> {
	const rows = await getDatabase()
		.select()
		.from(posts)
		.where(searchFilter(query))
		.orderBy(desc(posts.createdAt))
		.offset(skip)
		.limit(limit);
	return (await hydratePosts(rows)).map((post) => ({ ...post, searchScore: 1 }));
}
