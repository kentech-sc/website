import { randomUUID } from 'node:crypto';

import { eq } from 'drizzle-orm';

import {
	closeDatabase,
	getDatabase,
	initDatabase,
	transaction
} from '../../src/lib/server/database/client.js';
import {
	petitionSignatures,
	petitions,
	postLikes,
	posts,
	userIdentities,
	users
} from '../../src/lib/server/database/schema.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error('DATABASE_URL is required.');
}

const marker = `smoke-${randomUUID()}@example.invalid`;
const rollback = new Error('ROLLBACK_SMOKE_TEST');

try {
	await initDatabase(connectionString);

	try {
		await transaction(async () => {
			const db = getDatabase();
			const [author, reader] = await db
				.insert(users)
				.values([
					{
						email: marker,
						realName: 'Smoke Author',
						nickname: `smoke-${randomUUID()}`,
						group: 'user'
					},
					{
						email: marker,
						realName: 'Smoke Reader',
						nickname: `smoke-${randomUUID()}`,
						group: 'user'
					}
				])
				.returning();

			if (!author.createdAt.includes('T')) {
				throw new Error(`Timestamp values are not normalized ISO strings: ${author.createdAt}`);
			}

			await db.insert(userIdentities).values({
				userId: author.id,
				issuer: 'smoke-test',
				subject: randomUUID(),
				emailAtLogin: marker
			});

			const [post] = await db
				.insert(posts)
				.values({
					boardId: 'free',
					userId: author.id,
					displayType: 'nickname',
					title: 'Smoke test',
					content: 'Rollback-only test row'
				})
				.returning();
			await db.insert(postLikes).values({ postId: post.id, userId: reader.id });

			const [petition] = await db
				.insert(petitions)
				.values({
					petitionerId: author.id,
					title: 'Smoke test',
					content: 'Rollback-only test row'
				})
				.returning();
			await db.insert(petitionSignatures).values({ petitionId: petition.id, userId: reader.id });

			throw rollback;
		});
	} catch (error) {
		if (error !== rollback) throw error;
	}

	const remaining = await getDatabase().select().from(users).where(eq(users.email, marker));
	if (remaining.length !== 0) {
		throw new Error('Transaction rollback left smoke-test rows behind.');
	}

	console.log({ connected: true, transactionRollback: true, normalizedRelations: true });
} finally {
	await closeDatabase();
}
